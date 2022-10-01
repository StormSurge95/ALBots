import { Character, CMData, Constants, Database, Entity, EntityModel, GMap, IPosition, ItemName, LimitDCReportData,
    Mage, Merchant, MonsterName, Paladin, Pathfinder, Priest, Ranger, Rogue, SlotType, Tools, UIData, Warrior } from "../../../ALClient/build/index.js"
import { calculateAttackLoopCooldown, checkOnlyEveryMS, getMonsterHuntTargets, getPriority1Entities, getPriority2Entities,
    goGetRspeedBuff, goToNearestWalkableToMonster2, goToPotionSellerIfLow, LOOP_MS, REPLENISHABLES_TO_BUY, sleep,
    sortInventory, startAvoidStacking, startBuyFriendsReplenishablesLoop, startBuyLoop, startBuyReplenishablesLoop,
    startCompoundLoop, startCraftLoop, startElixirLoop, startExchangeLoop, startHealLoop, startLootLoop, startPartyLoop,
    startScareLoop, startSellLoop, startSendStuffDenylistLoop, startUpgradeLoop } from "./general.js"
import { doBanking, goFishing, goMining, startDismantleLoop, startMluckLoop } from "./merchant.js"
import { attackTheseTypesWarrior, startChargeLoop, startHardshellLoop, startWarcryLoop } from "./warrior.js"
import { CurrencyType, Information, MerchantStrategy, MonsterStrategy, Strategy, TokenType } from "../definitions/bot.js"
import { attackTheseTypesPriest, startDarkBlessingLoop, startPartyHealLoop } from "./priest.js"
import { attackTheseTypesRanger } from "./ranger.js"
import { attackTheseTypesRogue, startRSpeedLoop } from "./rogue.js"
import { attackTheseTypesMage, magiportStrangerIfNotNearby } from "./mage.js"
import { attackTheseTypesPaladin, startSelfHealLoop } from "./paladin.js"

export async function getTarget(bot: Character, strategy: Strategy, information: Information): Promise<MonsterName> {
    for (const entity of await getPriority1Entities(bot)) {
        if (!strategy[entity.type]) continue // No strategy
        if (strategy[entity.type].requireCtype &&
            !((information.tank.bot?.ctype == strategy[entity.type].requireCtype && information.tank.target == entity.type)
            || (information.healer.bot?.ctype == strategy[entity.type].requireCtype && information.healer.target == entity.type)
            || (information.dps.bot?.ctype == strategy[entity.type].requireCtype && information.dps.target == entity.type)
            || (information.merchant.bot?.ctype == strategy[entity.type].requireCtype && information.merchant.target == entity.type))) continue
        const realEntity = bot.entities.get(entity.name) || bot.entities.get((entity as Entity).id)
        if (realEntity) {
            return realEntity.type
        } else {
            if (Tools.distance(bot, entity) < Constants.MAX_VISIBLE_RANGE / 2) {
                // We're close, but we can't see the entity. It's probably dead
                Database.nextUpdate.set(`${bot.server.name}${bot.server.region}${entity.name}`, Date.now() + Constants.MONGO_UPDATE_MS)
                await EntityModel.deleteOne({ name: entity.name, serverIdentifier: bot.serverData.name, serverRegion: bot.serverData.region }).lean().exec()
            } else {
                return entity.type
            }
        }
    }

    for (const entity of await getPriority2Entities(bot)) {
        if (!strategy[entity.type]) continue // No strategy
        if (strategy[entity.type].requireCtype &&
            !((information.tank.bot?.ctype == strategy[entity.type].requireCtype && information.tank.target == entity.type)
            || (information.healer.bot?.ctype == strategy[entity.type].requireCtype && information.healer.target == entity.type)
            || (information.dps.bot?.ctype == strategy[entity.type].requireCtype && information.dps.target == entity.type))) continue
        const realEntity = bot.entities.get(entity.name) || bot.entities.get((entity as Entity).id)
        if (realEntity) {
            if (realEntity.couldGiveCreditForKill(bot)) return realEntity.type

            // Update the database to let others know that this entity is taken
            Database.nextUpdate.set(`${bot.server.name}${bot.server.region}${realEntity.id}`, Date.now() + Constants.MONGO_UPDATE_MS)
            await EntityModel.updateOne({ name: realEntity.id, serverIdentifier: bot.serverData.name, serverRegion: bot.serverData.region, type: realEntity.type },
                { hp: realEntity.hp, lastSeen: Date.now(), level: realEntity.level, map: realEntity.map, target: realEntity.target, x: realEntity.x, y: realEntity.y },
                { upsert: true }).lean().exec()
        } else {
            if (Tools.distance(bot, entity) < Constants.MAX_VISIBLE_RANGE / 2) {
                // We're close, but we can't see the entity. It's probably dead
                Database.nextUpdate.set(`${bot.server.name}${bot.server.region}${entity.name}`, Date.now() + Constants.MONGO_UPDATE_MS)
                await EntityModel.deleteOne({ name: entity.name, serverIdentifier: bot.serverData.name, serverRegion: bot.serverData.region }).lean().exec()
                continue
            }
            if (bot.G.monsters[entity.type].cooperative // Cooperative monsters always give credit
                || !entity.target // It doesn't have a target yet
                || [information.tank.name, information.healer.name, information.dps.name].includes(entity.target) // It's attacking one of our players
                || (bot.party && bot.partyData.list.includes(entity.target))) { // It's attacking one of our party members
                return entity.type
            }
        }
    }

    if (strategy.monsterhunt) {
        for (const type of await getMonsterHuntTargets(bot, information.friends)) {
            if (!strategy[type]) continue
            if (strategy[type].requireCtype &&
                !((information.tank.bot?.ctype == strategy[type].requireCtype && information.tank.target == type)
                || (information.healer.bot?.ctype == strategy[type].requireCtype && information.healer.target == type)
                || (information.dps.bot?.ctype == strategy[type].requireCtype && information.dps.target == type))) continue

            return type
        }
    }

    return strategy.defaultTarget
}

function getIdleTargets(strategy: Strategy): MonsterName[] {
    const idles: MonsterName[] = []
    for (const mon in strategy) {
        if (!strategy[mon as MonsterName].attackWhileIdle) continue
        idles.push(mon as MonsterName)
    }
    return idles
}

function getAssignedTarget(id: string, information: Information): MonsterName {
    if (id == information.tank.name) {
        return information.tank.target
    }
    if (id == information.healer.name) {
        return information.healer.target
    }
    if (id == information.dps.name) {
        return information.dps.target
    }
    return null
}

async function handleStrategy(bot: Character, strategy: MonsterStrategy, friends?: Character[]): Promise<void> {
    if (strategy.equipment) {
        for (const s in strategy.equipment) {
            const slot = s as SlotType
            const itemName = strategy.equipment[slot]
            if (!itemName) {
                continue
            }
            const wType = bot.G.items[itemName].wtype

            if (bot.slots[slot]?.name == itemName) {
                // We already have it equipped; see if there's a higher level item to equip
                const alternative = bot.locateItem(itemName, bot.items, { returnHighestLevel: true })
                if (alternative !== undefined && bot.items[alternative].level > bot.slots[slot].level) {
                    // We have a higher level item in our inventory, equip that instead
                    await bot.equip(alternative, slot)
                }
                continue
            }

            if (bot.G.classes[bot.ctype].doublehand[wType]) {
                // Check if we have something in our offhand; if so, we need to unequip it.
                if (bot.slots.offhand) await bot.unequip("offhand")
            }

            if (slot == "offhand" && bot.slots["mainhand"]) {
                const mainhandItem = bot.slots["mainhand"].name
                const mainhandWType = bot.G.items[mainhandItem].wtype
                if (bot.G.classes[bot.ctype].doublehand[mainhandWType]) {
                    // We're equipping an offhand item, but we have a doublehand item equipped in our mainhand.
                    await bot.unequip("mainhand")
                }
            }

            if (!bot.slots[slot]
                || (bot.slots[slot] && bot.slots[slot].name !== itemName)) {
                const i = bot.locateItem(itemName, bot.items, { returnHighestLevel: true })
                if (i !== undefined) await bot.equip(i, slot)
            }
        }
    }

    await strategy.attack(bot, friends)
}

export async function startMage(bot: Mage, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    bot.socket.on("cm", async (data: CMData) => {
        if (partyMembers.includes(data.name)) {
            // Friendly CM
            const parsedData = JSON.parse(data.message)

            if (parsedData == "magiport") {
                // Let mages do magiport requests for party members
                console.log(`${bot.id} is going to try to magiport ${data.name}!`)
                magiportStrangerIfNotNearby(bot, data.name)
            }

            return
        }

        console.log(`~~~ CM from ${data.name} DEBUG ~~~`)
        console.log(data)
        console.log("~~~ party members ~~~")
        console.log(partyMembers)
    })

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)

            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                await handleStrategy(bot, strategy[target], information.friends)
            }

            await attackTheseTypesMage(bot, idleTargets, information.friends)

            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[mage]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[mage]: ${e}`))
}

export async function startMerchant(bot: Merchant, strategy: MerchantStrategy, information: Information, standPlace: IPosition, partyLeader: string, partyMembers: string[]): Promise<void> {
    const magiporters = new Set(["Bjarny", "Clarity", ...partyMembers])
    bot.socket.on("magiport", async (data: { name: string }) => {
        if (magiporters.has(data.name)) {
            await bot.acceptMagiport(data.name)
            await bot.stopSmartMove()
            await bot.stopWarpToTown()
            await bot.sendGold(data.name, 10_000)
            return
        }
    })

    bot.socket.on("cm", async (data: CMData) => {
        console.log(`~~~ CM from ${data.name} DEBUG ~~~`)
        console.log(JSON.stringify(data, undefined, 4))
    })

    bot.socket.on("limitdcreport", async (data: LimitDCReportData) => {
        console.log(`~~~ ${bot.id} disconnected for doing too many things ~~~`)
        console.log(JSON.stringify(data, undefined, 4))
    })

    bot.socket.on("ui", async (data: UIData) => {
        if (data.type == "rspeed" && data.to == bot.id) {
            bot.sendGold(data.from, 1_000).catch(e => console.error(`[${bot.ctype}]: ${e}`))
        }
    })

    bot.socket.on("code_eval", async (data: string) => {
        const dataRegex = /^(\w+)\s+(\w+)\s*(\w*)\s*(\w*)/.exec(data)
        const state = dataRegex[1]
        const action = dataRegex[2]
        const item = dataRegex[3] as ItemName
        const info = dataRegex[4]
        if (!(state == "add" || state == "remove" || state == "list")) {
            console.log(`[merchant]: I can either 'add' to or 'remove' from my to-do lists, or I can 'list' their contents...not too sure how to '${state}' them...`)
            return
        }
        if (["add", "remove"].includes(state) && !item) {
            console.log("[merchant]: I need an item name!")
            return
        }
        if (item && !bot.G.items[item]) {
            console.log(`[merchant]: I'm not too sure what '${item}' is...`)
            return
        }
        switch (action) {
            case "buy": {
                if (state == "add") {
                    if (!info) {
                        console.log(`[merchant]: I didn't get any info...I need to know what type of currency to use to buy ${item}...`)
                        break
                    }
                    const currency = info.trim() as CurrencyType
                    console.log(`[merchant]: adding ${item} to ${action} list (${currency})!`)
                    strategy.buy[currency].add(item)
                    break
                } else if (state == "list") {
                    if (!info) {
                        console.log("[merchant]: full buy list:")
                        for (const cType in strategy.buy) {
                            const currency = cType as CurrencyType
                            console.log(`${currency}: ${JSON.stringify([...strategy.buy[currency]], undefined, 4)}`)
                        }
                        break
                    }
                    const currency = info.trim() as CurrencyType
                    console.log(`[merchant]: ${currency} buy list: ${JSON.stringify([...strategy.buy[currency]], undefined, 4)}`)
                    break
                } else {
                    if (!info) {
                        console.log(`[merchant]: removing ${item} from all possible ${action} lists...`)
                        for (const cType in strategy.buy) {
                            strategy.buy[cType as CurrencyType].delete(item)
                        }
                        break
                    }
                    const currency = info.trim() as CurrencyType
                    console.log(`[merchant]: removing ${item} from ${action} list (${currency})!`)
                    strategy.buy[currency].delete(item)
                    break
                }
            }
            case "compound": {
                if (state == "add") {
                    if (!bot.G.items[item].compound) {
                        console.log(`[merchant]: '${item}' is not compoundable...`)
                        return
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.compound.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.compound], undefined, 4)}`)
                    break
                } else {
                    strategy.compound.delete(item)
                    break
                }
            }
            case "craft": {
                if (state == "add") {
                    if (!bot.G.craft[item]) {
                        console.log(`[merchant]: '${item}' is not craftable...`)
                        break
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.craft.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.craft], undefined, 4)}`)
                    break
                } else {
                    strategy.craft.delete(item)
                    break
                }
            }
            case "dismantle": {
                if (state == "add") {
                    if (!bot.G.dismantle[item]) {
                        console.log(`[merchant]: '${item}' can't be dismantled...`)
                        break
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.dismantle.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.dismantle], undefined, 4)}`)
                    break
                } else {
                    strategy.dismantle.delete(item)
                    break
                }
            }
            case "exchange": {
                if (state == "add") {
                    if (!bot.G.items[item].e) {
                        console.log(`[merchant]: '${item}' can't be exchanged...`)
                        return
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.exchange.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.exchange], undefined, 4)}`)
                    break
                } else {
                    strategy.exchange.delete(item)
                    break
                }
            }
            case "hold": {
                if (state == "add") {
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.hold.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.hold], undefined, 4)}`)
                    break
                } else {
                    strategy.hold.delete(item)
                    break
                }
            }
            case "list": {
                if (state == "add") {
                    if (!info) {
                        console.log(`[merchant]: I need 'level' and 'price' info in order to add '${item}'!`)
                        break
                    }
                    const [levelStr, priceStr] = info.trim().split(" ")
                    const level = Number.parseInt(levelStr)
                    const price = Number.parseInt(priceStr)
                    if (isNaN(level) || isNaN(price)) {
                        console.log("[merchant]: I got invalid info...you'll have to try again (\"add list <item> <level> <price>\").")
                        break
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.list[item][level] = price
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify(strategy.list, undefined, 4)}`)
                    break
                } else {
                    if (!info) {
                        console.log(`[merchant]: I didn't get any info...so I'll just remove all of the data for '${item}' from my list...`)
                        delete strategy.list[item]
                    } else {
                        let level = Number.parseInt(info.trim())
                        if (isNaN(level)) {
                            console.log("[merchant]: Invalid info given...I'll just use '0'... (\"remove list <item> <level>\")")
                            level = 0
                        }
                        delete strategy.list[item][level]
                    }
                    break
                }
            }
            case "sell": {
                if (state == "add") {
                    if (!info) {
                        console.log(`[merchant]: I didn't get any info...so I'll just sell ALL '${item}' I receive...`)
                        strategy.sell[item] = 0
                        break
                    }
                    const level = Number.parseInt(info.trim())
                    if (isNaN(level)) {
                        console.log("[merchant]: Invalid info given...I'll just use '0'...")
                        strategy.sell[item] = 0
                        break
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.sell[item] = level
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify(strategy.sell, undefined, 4)}`)
                    break
                } else {
                    delete strategy.sell[item]
                    break
                }
            }
            case "upgrade": {
                if (state == "add") {
                    if (!bot.G.items[item].upgrade) {
                        console.log(`[merchant]: '${item}' is not upgradeable...`)
                        return
                    }
                    console.log(`[merchant]: adding ${item} to ${action} list!`)
                    strategy.upgrade.add(item)
                    break
                } else if (state == "list") {
                    console.log(`[merchant]: ${JSON.stringify([...strategy.upgrade], undefined, 4)}`)
                    break
                } else {
                    strategy.upgrade.delete(item)
                    break
                }
            }
            case "default": {
                console.log(`[merchant]: I have no idea how to '${action}'...`)
                break
            }
        }
    })

    startSellLoop(bot, strategy.sell, strategy.list)
    startCraftLoop(bot, strategy.craft)
    startExchangeLoop(bot, strategy.exchange)
    startUpgradeLoop(bot, strategy.sell, strategy.upgrade)
    startCompoundLoop(bot, strategy.sell, strategy.compound)
    startDismantleLoop(bot, strategy.dismantle)
    startBuyFriendsReplenishablesLoop(bot, information.friends)
    startMluckLoop(bot)
    startBuyLoop(bot, strategy.buy.gold)
    startHealLoop(bot)

    if (bot.id == partyLeader) startPartyLoop(bot, partyLeader, partyMembers)
    else bot.timeouts.set("partyLoop", setTimeout(() => startPartyLoop(bot, partyLeader, partyMembers), 2000))

    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            // If we're dead, respawn
            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                return
            }

            // Wait for mining/fishing/exchange/compound/upgrade to complete
            if (bot.c.mining || bot.c.fishing || bot.q.exchange || bot.q.compound || bot.q.upgrade) {
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                return
            }

            // If we are full, let's go to the bank
            if (checkOnlyEveryMS(`${bot.id}_bank`, 120_000) || bot.isFull() || bot.hasPvPMarkedItem()) {
                console.log("[merchant]: We are going to do some banking!")
                await bot.closeMerchantStand()
                await doBanking(bot, strategy.maxGold, strategy.hold, strategy.sell, strategy.craft, strategy.exchange, strategy.list, strategy.upgrade, strategy.compound, strategy.dismantle)
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                return
            }

            // Get some holiday spirit if it's Christmas
            if (bot.S && bot.S.holidayseason && !bot.s.holidayspirit) {
                console.log("[merchant]: We are going to get holiday buffs!")
                await bot.closeMerchantStand()
                await bot.smartMove("newyear_tree", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.socket.volatile.emit("interaction", { type: "newyear_tree" })
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, Math.min(...bot.pings) * 2))
                return
            }

            // mluck our friends
            if (bot.canUse("mluck", { ignoreCooldown: true })) {
                for (const friend of information.friends) {
                    if (!friend) continue
                    if (friend.id == bot.id) continue
                    if (!friend.s.mluck || !friend.s.mluck.strong || friend.s.mluck.ms < 120_000) {
                        // Move to them, and we'll automatically mluck them
                        if (Tools.distance(bot, friend) > bot.G.skills.mluck.range * 0.9) {
                            console.log(`[merchant] We are moving to ${friend.name} to mluck them!`)
                            await bot.closeMerchantStand()
                            await bot.smartMove(friend, { getWithin: bot.G.skills.mluck.range / 2, stopIfTrue: () => (friend.s.mluck?.strong && friend.s.mluck?.ms >= 120_000) || Tools.distance(bot.smartMoving, friend) > bot.G.skills.mluck.range })
                        }
                        bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                        return
                    }
                }
            }

            // help our friends with their inventories
            for (const friend of information.friends) {
                if (!friend) continue
                if (friend.id == bot.id) continue
                if (friend.id == partyLeader && (friend.isFull() || friend.gold >= 5_000_000)) {
                    console.log(`[merchant] We are moving to ${friend.name} to clear their inventory!`)
                    await bot.closeMerchantStand()
                    await bot.smartMove(friend, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, stopIfTrue: () => bot.isFull() || !(friend.isFull() || friend.gold >= 5_000_000) || Tools.distance(bot.smartMoving, friend) > 400 })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
                if (!(friend.hasItem("computer") || friend.hasItem("supercomputer"))) {
                    for (const [item, amount] of REPLENISHABLES_TO_BUY) {
                        if (friend.countItem(item) > amount * 0.25) continue // They have enough
                        if (!bot.canBuy(item)) continue // We can't buy this item
                        if (!(bot.hasItem("computer") || bot.hasItem("supercomputer"))) {
                            await bot.closeMerchantStand()
                            await bot.smartMove("fancypots", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                            await sleep(1000)
                        }
                        await bot.smartMove(friend, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, stopIfTrue: () => !bot.canBuy(item) || friend.countItem(item) > amount * 0.25 || Tools.distance(bot.smartMoving, friend) > 400 })
                        bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                        return
                    }
                }
            }

            // exchange items if we can
            for (const item of strategy.exchange) {
                if (bot.canExchange(item, { ignoreLocation: true }) && bot.esize >= 5) {
                    console.log(`[merchant] we are going to exchange ${item}!`)
                    await bot.closeMerchantStand()
                    await bot.smartMove(Pathfinder.locateExchangeNPC(item), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, stopIfTrue: () => bot.q?.exchange !== undefined && bot.q?.exchange !== null })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
            }

            // craft items if we can
            for (const item of strategy.craft) {
                if (bot.canCraft(item, { ignoreLocation: true }) && bot.esize >= 5) {
                    console.log(`[merchant] we are going to craft ${item}!`)
                    await bot.closeMerchantStand()
                    const count = bot.countItem(item)
                    await bot.smartMove(Pathfinder.locateCraftNPC(item), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, stopIfTrue: () => bot.countItem(item) >= count + 1 })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
            }

            // dismantle items if we can
            for (const item of strategy.dismantle) {
                if (bot.hasItem(item) && bot.esize >= 2) {
                    console.log(`[merchant]: we are going to dismantle ${item}!`)
                    await bot.closeMerchantStand()
                    const count = bot.countItem(item)
                    await bot.smartMove("craftsman", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, stopIfTrue: () => bot.countItem(item) <= count - 1 })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
            }

            // Go fishing if we can
            if (strategy.fish) {
                await goFishing(bot, strategy)
                if (bot.canUse("fishing", { ignoreEquipped: true })) {
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
            }

            // Go mining if we can
            if (strategy.mine) {
                await goMining(bot, strategy)
                if (bot.canUse("mining", { ignoreEquipped: true })) {
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
                    return
                }
            }

            for (const tType in strategy.buy) {
                if (tType === "gold") continue
                const tokenType = tType as TokenType
                for (const item of strategy.buy[tokenType]) {
                    const count = bot.countItem(tokenType as ItemName)
                    if (count < bot.G.tokens[tokenType][item]) continue
                    await bot.smartMove(Pathfinder.locateExchangeNPC(tokenType as ItemName), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    await bot.buyWithTokens(item, tokenType)
                }
            }

            // buy tracker with monstertokens if we don't have one to list for sale
            if (strategy.list["tracker"] && !bot.isListedForSale("tracker") && !bot.hasItem("tracker", bot.items, { locked: false }) && bot.countItem("monstertoken") >= bot.G.tokens.monstertoken.tracker) { // We can trade tokens for one
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                // Buy a tracker with tokens
                await bot.buyWithTokens("tracker", "monstertoken")
                const tracker = bot.locateItem("tracker", bot.items, { locked: false })
                await bot.listForSale(tracker, strategy.list["tracker"][0])
            }

            await bot.smartMove(standPlace)
            await bot.openMerchantStand()
        } catch (e) {
            console.error(`[merchant] ${e}`)
        }

        bot.timeouts.set("moveLoop", setTimeout(moveLoop, 250))
    }
    moveLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))

    async function merchantLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.stand || bot.rip) {
                // Dead, or stand isn't open
                bot.timeouts.set("merchantLoop", setTimeout(merchantLoop, LOOP_MS))
                return
            }

            for (const tL in strategy.list) {
                const item = tL as ItemName
                const listData = strategy.list[item]

                for (const invItem of bot.locateItems(item, bot.items, { locked: false, special: false })) {
                    const itemInfo = bot.items[invItem]
                    const level = itemInfo.level ?? 0
                    const price = listData[level]
                    if (price) {
                        if (!itemInfo.q) await bot.listForSale(invItem, price)
                        else await bot.listForSale(invItem, price, undefined, itemInfo.q)
                    }
                }
            }
        } catch (e) {
            console.error(`[merchant] ${e}`)
        }

        bot.timeouts.set("merchantLoop", setTimeout(merchantLoop, LOOP_MS))
    }
    merchantLoop().catch(e => console.error(`[merchant]: ${e}`))
}

export async function startPaladin(bot: Paladin, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    startSelfHealLoop(bot)

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)
            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                await handleStrategy(bot, strategy[target], information.friends)
            }

            await attackTheseTypesPaladin(bot, idleTargets, information.friends)

            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[paladin]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[paladin]: ${e}`))
}

export async function startPriest(bot: Priest, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    startDarkBlessingLoop(bot)
    startPartyHealLoop(bot, information.friends)

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)
            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                await handleStrategy(bot, strategy[target], information.friends)
            }

            await attackTheseTypesPriest(bot, idleTargets, information.friends, { healStrangers: false })

            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[priest]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[priest]: ${e}`))
}

export async function startRanger(bot: Ranger, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)

            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                await handleStrategy(bot, strategy[target], information.friends)
            }

            await attackTheseTypesRanger(bot, idleTargets, information.friends)

            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[ranger]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[ranger]: ${e}`))
}

export async function startRogue(bot: Rogue, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    startRSpeedLoop(bot, { enableGiveToStrangers: true })

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)

            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                await handleStrategy(bot, strategy[target], information.friends)
            }

            await attackTheseTypesRogue(bot, idleTargets, information.friends)

            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[rogue]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))
}

export async function startWarrior(bot: Warrior, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    startShared(bot, strategy, information, partyLeader, partyMembers)

    startChargeLoop(bot)
    startHardshellLoop(bot)
    startWarcryLoop(bot)

    const idleTargets = getIdleTargets(strategy)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(attackLoop, LOOP_MS))
                return
            }

            const target = getAssignedTarget(bot.id, information)

            if (target && strategy[target] && !bot.isOnCooldown("scare")) {
                // follow strategy
                await handleStrategy(bot, strategy[target], information.friends)
            }

            // handle idle combat
            await attackTheseTypesWarrior(bot, idleTargets, information.friends, { disableAgitate: true })

            // attack things targeting us
            if (bot.canUse("attack")) {
                for (const entity of bot.getEntities({
                    targetingPartyMember: true,
                    withinRange: bot.range
                })) {
                    await bot.basicAttack(entity.id)
                    break
                }
            }
        } catch (e) {
            console.error(`[warrior]: ${e}`)
        }

        bot.timeouts.set("attackLoop", setTimeout(attackLoop, calculateAttackLoopCooldown(bot)))
    }
    attackLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))
}

export async function startShared(bot: Character, strategy: Strategy, information: Information, partyLeader: string, partyMembers: string[]): Promise<void> {
    const magiporters = new Set(["Bjarny", "Clarity", ...partyMembers])
    bot.socket.on("magiport", async (data: { name: string }) => {
        if (magiporters.has(data.name)) {
            await bot.acceptMagiport(data.name)
            await bot.stopSmartMove()
            await bot.stopWarpToTown()
            await bot.sendGold(data.name, 10_000)
            return
        }
    })

    bot.socket.on("cm", (data: CMData) => {
        if (data.name == partyLeader) {
            if (data.message == "go hunting") {
                strategy.monsterhunt = true
            } else if (data.message.startsWith("farm ")) {
                strategy.monsterhunt = false
                const target = data.message.substring(5)
                strategy.defaultTarget = target as MonsterName
            }
        }
        console.log(`~~~ CM from ${data.name} DEBUG ~~~`)
        console.log(JSON.stringify(data, undefined, 4))
    })

    bot.socket.on("limitdcreport", async (data: LimitDCReportData) => {
        console.log(`~~~ ${bot.id} disconnected for doing too many things ~~~`)
        console.log(JSON.stringify(data, undefined, 4))
    })

    bot.socket.on("ui", async (data: UIData) => {
        if (data.type == "rspeed" && data.to == bot.id) {
            bot.sendGold(data.from, 1_000).catch(e => console.error(`[${bot.ctype}]: ${e}`))
        }
    })

    startAvoidStacking(bot)
    startBuyReplenishablesLoop(bot)
    startHealLoop(bot)
    startLootLoop(bot, information.friends)
    startElixirLoop(bot, "elixirluck")
    startScareLoop(bot)

    if (bot.id == partyLeader) {
        bot.socket.on("code_eval", async (data: string) => {
            if (data == "go hunting") {
                strategy.monsterhunt = true
                const cms: string[] = []
                for (const friend of information.friends) {
                    if (friend.ctype == "merchant") continue
                    if (friend.id == bot.id) continue
                    cms.push(friend.id)
                }
                await bot.sendCM(cms, "go hunting")
            } else if (data.startsWith("farm ")) {
                let target = data.substring(5)
                if (Object.keys(bot.G.items).includes(target)) {
                    if (["intring", "dexring", "strring"].includes(target)) target = "statring"
                    else if (["intbelt", "dexbelt", "strbelt"].includes(target)) target = "statbelt"
                    else if (["intamulet", "dexamulet", "stramulet"].includes(target)) target = "statamulet"
                    const mon = Object.keys(bot.G.drops.monsters).find(key => {
                        for (const drop of bot.G.drops.monsters[key]) {
                            if (drop.length == 3 && drop[1] == "open" && bot.G.drops[drop[2]].includes(target)) return true
                            if (drop.includes(target)) return true
                        }
                        return false
                    })
                    const tgt = (mon == undefined) ? (bot.G.maps[Object.keys(bot.G.drops.maps).find(key => {
                        for (const drop of bot.G.drops.maps[key]) {
                            if (drop.length == 3 && drop[1] == "open" && bot.G.drops[drop[2]].includes(target)) return true
                            if (drop.includes(target)) return true
                        }
                        return false
                    })] as GMap).monsters[0].type : mon
                    console.log(`INFO: changing farm target to ${tgt}...`)
                    strategy.monsterhunt = false
                    strategy.defaultTarget = tgt as MonsterName
                    const cms: string[] = []
                    for (const friend of information.friends) {
                        if (friend.ctype == "merchant") continue
                        if (friend.id == bot.id) continue
                        cms.push(friend.id)
                    }
                    await bot.sendCM(cms, `farm ${tgt}`)
                } else if (Object.keys(bot.G.monsters).includes(target)) {
                    console.log(`INFO: changing farm target to ${target}`)
                    strategy.monsterhunt = false
                    strategy.defaultTarget = target as MonsterName
                    const cms: string[] = []
                    for (const friend of information.friends) {
                        if (friend.ctype == "merchant") continue
                        if (friend.id == bot.id) continue
                        cms.push(friend.id)
                    }
                    await bot.sendCM(cms, `farm ${target}`)
                } else {
                    console.log("invalid target data passed")
                    console.log(target)
                }
            }
        })

        startPartyLoop(bot, partyLeader, partyMembers)
        startSendStuffDenylistLoop(bot, [information.merchant.name])
    } else {
        bot.timeouts.set("partyLoop", setTimeout(() => startPartyLoop(bot, partyLeader, partyMembers), 2000))
        startSendStuffDenylistLoop(bot, [partyLeader])
    }

    const moveLoop = async () => {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15_000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            if (strategy.monsterhunt) {
                if (!bot.s.monsterhunt) {
                    await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, useBlink: true })
                    await bot.getMonsterHuntQuest()
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS * 2))
                    return
                }

                if (bot.s.monsterhunt && bot.s.monsterhunt.c == 0) {
                    await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4, useBlink: true })
                    await bot.finishMonsterHuntQuest()
                    await bot.getMonsterHuntQuest()
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS * 2))
                    return
                }
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            if (bot.S && bot.S.holidayseason && !bot.s.holidayspirit) {
                await bot.smartMove("newyear_tree", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.socket.volatile.emit("interaction", { type: "newyear_tree" })
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, Math.min(...bot.pings) * 2))
                return
            }

            if (checkOnlyEveryMS(`${bot.id}_rspeed`, 10_000)) await goGetRspeedBuff(bot)

            if (checkOnlyEveryMS(`${bot.id}_sort_inv`, 15_000)) await sortInventory(bot)

            if (!bot.slots.elixir
                && !(bot.hasItem("computer") || bot.hasItem("supercomputer"))
                && bot.canBuy("elixirluck", { ignoreLocation: true })
                && !bot.isFull()) {
                await bot.smartMove("elixirluck", { stopIfTrue: () => bot.slots.elixir?.name == "elixirluck" })
            }

            if (bot.S.goobrawl) {
                if (bot.map !== "goobrawl") await bot.join("goobrawl")
                goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            if (bot.id == information.tank.name) {
                if (information.tank.target) await strategy[information.tank.target].move(bot, information.healer.bot)
            } else if (bot.id == information.healer.name) {
                if (information.healer.target) await strategy[information.healer.target].move(bot)
            } else if (bot.id == information.dps.name) {
                if (information.dps.target) await strategy[information.dps.target].move(bot, information.healer.bot)
            }
        } catch (e) {
            console.error(`[${bot.ctype}]: ${e}`)
        }

        bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
    }
    moveLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))

    const targetLoop = async (): Promise<void> => {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            const newTarget = await getTarget(bot, strategy, information)
            if (bot.id == information.tank.name) {
                if (newTarget !== information.tank.target) {
                    bot.stopSmartMove().catch(() => { /* */ })
                    console.log(`changing ${information.tank.name}'s target from ${information.tank.target} to ${newTarget}`)
                }
                information.tank.target = newTarget
            } else if (bot.id == information.healer.name) {
                if (newTarget !== information.healer.target) {
                    bot.stopSmartMove().catch(() => { /* */ })
                    console.log(`changing ${information.healer.name}'s target from ${information.healer.target} to ${newTarget}`)
                }
                information.healer.target = newTarget
            } else if (bot.id == information.dps.name) {
                if (newTarget !== information.dps.target) {
                    bot.stopSmartMove().catch(() => { /* */ })
                    console.log(`changing ${information.dps.name}'s target from ${information.dps.target} to ${newTarget}`)
                }
                information.dps.target = newTarget
            }
        } catch (e) {
            console.error(`[${bot.ctype}]: ${e}`)
        }

        bot.timeouts.set("targetLoop", setTimeout(targetLoop, 1000))
    }
    targetLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))
}