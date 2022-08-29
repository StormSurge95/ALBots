import AL, { Character, Constants, Entity, IPosition, Mage, Merchant, MonsterName, Pathfinder, Priest, ServerIdentifier, ServerRegion, Tools, Warrior } from "alclient"
import { calculateAttackLoopCooldown, goToPotionSellerIfLow, goToSpecialMonster, ITEMS_TO_CRAFT, ITEMS_TO_EXCHANGE, ITEMS_TO_HOLD, ITEMS_TO_SELL, LOOP_MS, sleep, startAvoidStacking, startBuyFriendsReplenishablesLoop, startBuyLoop, startCompoundLoop, startCraftLoop, startElixirLoop, startExchangeLoop, startHealLoop, startLootLoop, startPartyLoop, startSellLoop, startSendStuffDenylistLoop, startTrackerLoop, startUpgradeLoop } from "../base/general.js"
import { attackTheseTypesWarrior, startChargeLoop, startHardshellLoop, startWarcryLoop } from "../base/warrior.js"
import { attackTheseTypesPriest, startDarkBlessingLoop, startPartyHealLoop } from "../base/priest.js"
import { doBanking, goFishing, goMining, startMluckLoop } from "../base/merchant.js"
import { offsetPositionParty } from "../base/locations.js"
import { sortClosestDistance } from "../base/sort.js"
import { attackTheseTypesMage } from "../base/mage.js"
import { Command } from "commander"

const merchantID = "StormSurge"
const warriorID = "WarriorSurge"
const priestID = "PriestSurge"
const mageID = "MageSurge"

let merchant: Merchant
let warrior: Warrior
let priest: Priest
let mage: Mage
const friends: Character[] = [undefined, undefined, undefined, undefined]
const target: MonsterName = "phoenix"
let nearbyMage: Entity, nearbyPriest: Entity, nearbyWarrior: Entity
let location: IPosition = undefined

const partyLeader = warriorID
const partyMembers = [warriorID, priestID, mageID, merchantID]

const program = new Command()
program.option<ServerRegion>("-r, --region <server>", "The server region.", v => v as ServerRegion, "US")
program.option<ServerIdentifier>("-i, --identifier <name>", "The server identifier.", v => v as ServerIdentifier, "I")
program.parse(process.argv)
const options = program.opts()

async function startShared(bot: Character, merchantID: string, friends: Character[]): Promise<void> {
    startBuyLoop(bot)
    startHealLoop(bot)
    startLootLoop(bot, friends)
    if (bot.ctype != "merchant") {
        startAvoidStacking(bot)
        startElixirLoop(bot, "elixirluck")
        if (bot.id == partyLeader) startSendStuffDenylistLoop(bot, [merchantID], ITEMS_TO_HOLD, 500_000)
        else startSendStuffDenylistLoop(bot, [partyLeader], ITEMS_TO_HOLD, 500_000)
    }
    if (bot.id == partyLeader) startPartyLoop(bot, partyLeader, partyMembers)
    else bot.timeouts.set("partyLoop", setTimeout(async () => { startPartyLoop(bot, partyLeader, partyMembers) }, 2000))
}

async function startWarrior(bot: Warrior, merchantID: string, friends: Character[]): Promise<void> {
    startShared(bot, merchantID, friends)

    startChargeLoop(bot)
    startHardshellLoop(bot)
    startWarcryLoop(bot)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            const warTargs = warrior.targets
            const priTargs = priest ? priest.targets : 0
            const magTargs = mage ? mage.targets : 0

            if (priTargs > 0 || magTargs > 0) {
                if (warTargs > 0) await attackTheseTypesWarrior(bot, undefined, friends, { targetingPartyMember: true })
                else await attackTheseTypesWarrior(bot, undefined, friends, { targetingPartyMember: true })
            } else {
                await attackTheseTypesWarrior(bot, [target], friends, { disableStomp: true })
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, calculateAttackLoopCooldown(bot)))
    }
    attackLoop()

    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 1000))
                return
            }

            if (!bot.slots.elixir
                && !(bot.hasItem("computer") || bot.hasItem("supercomputer"))
                && bot.canBuy("elixirluck", { ignoreLocation: true })
                && !bot.isFull()) {
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 2 }).catch(() => { /* */ })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            nearbyWarrior = bot.getEntity({ returnNearest: true, type: target })
            if (nearbyWarrior || nearbyPriest || nearbyMage) {
                if (bot.smartMoving) await bot.stopSmartMove()
                if (!location) location = Pathfinder.locateMonster(target).sort(sortClosestDistance(bot))[0]
                await bot.smartMove(offsetPositionParty(location, bot)).catch(() => { /* ignore errors */ })
            } else {
                location = undefined
                await goToSpecialMonster(bot, target)
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 200))
    }
    moveLoop()
}

async function startPriest(bot: Priest, merchantID: string, friends: Character[]) {
    startShared(bot, merchantID, friends)

    startDarkBlessingLoop(bot)
    startPartyHealLoop(bot, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            await attackTheseTypesPriest(bot, undefined, friends, { targetingPartyMember: true })
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, calculateAttackLoopCooldown(bot)))
    }
    attackLoop()

    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 1000))
                return
            }

            if (!bot.slots.elixir
                && !(bot.hasItem("computer") || bot.hasItem("supercomputer"))
                && bot.canBuy("elixirluck", { ignoreLocation: true })
                && !bot.isFull()) {
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 2 }).catch(() => { /* */ })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            nearbyPriest = bot.getEntity({ returnNearest: true, type: target })
            if (nearbyPriest || nearbyWarrior || nearbyMage) {
                if (bot.smartMoving) await bot.stopSmartMove()
                if (!location) location = Pathfinder.locateMonster(target).sort(sortClosestDistance(bot))[0]
                await bot.smartMove(offsetPositionParty(location, bot, 50)).catch(() => { /* ignore errors */ })
            } else {
                location = undefined
                await goToSpecialMonster(bot, target)
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 200))
    }
    moveLoop()
}

async function startMage(bot: Mage, merchantID: string, friends: Character[]) {
    startShared(bot, merchantID, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            await attackTheseTypesMage(bot, undefined, friends, { targetingPartyMember: true })
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, calculateAttackLoopCooldown(bot)))
    }
    attackLoop()

    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 1000))
                return
            }

            if (!bot.slots.elixir
                && !(bot.hasItem("computer") || bot.hasItem("supercomputer"))
                && bot.canBuy("elixirluck", { ignoreLocation: true })
                && !bot.isFull()) {
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 2 }).catch(() => { /* */ })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            nearbyMage = bot.getEntity({ returnNearest: true, type: target })
            if (nearbyMage || nearbyWarrior || nearbyPriest) {
                if (bot.smartMoving) await bot.stopSmartMove()
                if (!location) location = Pathfinder.locateMonster(target).sort(sortClosestDistance(bot))[0]
                await bot.smartMove(offsetPositionParty(location, bot, 50)).catch(() => { /* ignore errors */ })
            } else {
                location = undefined
                await goToSpecialMonster(bot, target)
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 200))
    }
    moveLoop()
}

async function startMerchant(bot: Merchant, friends: Character[], standPlace: IPosition) {
    startShared(bot, bot.id, friends)

    startBuyFriendsReplenishablesLoop(bot, friends)
    startMluckLoop(bot)
    startUpgradeLoop(bot, ITEMS_TO_SELL)
    startCompoundLoop(bot, ITEMS_TO_SELL)
    startCraftLoop(bot, ITEMS_TO_CRAFT)
    startExchangeLoop(bot, ITEMS_TO_EXCHANGE)
    startSellLoop(bot)

    let lastBankVisit = Number.MIN_VALUE
    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 1000))
                return
            }

            if (bot.isFull() || lastBankVisit < Date.now() - 300000 || bot.hasPvPMarkedItem()) {
                lastBankVisit = Date.now()
                await bot.closeMerchantStand()
                await doBanking(bot)
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            if (bot.canUse("mluck", { ignoreCooldown: true })) {
                for (const friend of friends) {
                    if (!friend) continue
                    if (friend.id == bot.id) continue
                    if (!friend.s.mluck || !friend.s.mluck.strong || friend.s.mluck.ms < 120000 || friend.s.mluck.f !== bot.id) {
                        if (Tools.distance(bot, friend) > bot.G.skills.mluck.range - 10) {
                            await bot.closeMerchantStand()
                            console.log(`[merchant] We are moving to ${friend.name} to mluck them!`)
                            await bot.smartMove(friend, { getWithin: bot.G.skills.mluck.range / 2 })
                        }

                        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                        return
                    }
                }
            }

            if (warrior && (warrior.isFull() || warrior.gold >= 1_500_000)) {
                await bot.closeMerchantStand()
                await bot.smartMove(warrior, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 2 })
                lastBankVisit = Date.now()
                await doBanking(bot)
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            for (const item of ITEMS_TO_CRAFT) {
                if (bot.canCraft(item, { ignoreLocation: true })) {
                    await bot.smartMove("craftsman")
                    bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                    return
                }
            }

            for (const item of ITEMS_TO_EXCHANGE) {
                if (bot.canExchange(item, { ignoreLocation: true })) {
                    await bot.closeMerchantStand()
                    const loc = Pathfinder.locateExchangeNPC(item)
                    await bot.smartMove(loc, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                    return
                }
            }

            await goFishing(bot)
            if (!bot.isOnCooldown("fishing") && (bot.hasItem("rod") || bot.isEquipped("rod"))) {
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            await goMining(bot)
            if (!bot.isOnCooldown("mining") && (bot.hasItem("pickaxe") || bot.isEquipped("pickaxe"))) {
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 250))
                return
            }

            await bot.smartMove(standPlace)
            await bot.openMerchantStand()
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }

        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData(true, true)])
    await Pathfinder.prepare(AL.Game.G, { cheat: true })

    console.log("Starting bots...")

    const startWarriorLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (warrior) warrior.disconnect()

                warrior = await AL.Game.startWarrior(name, region, identifier)
                friends[0] = warrior
                startWarrior(warrior, merchantID, friends)
                startTrackerLoop(warrior)
                warrior.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`${name}: ${e}`)
                if (warrior) warrior.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    startWarriorLoop(warriorID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startPriestLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (priest) priest.disconnect()
                priest = await AL.Game.startPriest(name, region, identifier)
                friends[1] = priest
                startPriest(priest, merchantID, friends)
                startTrackerLoop(priest)
                priest.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`${name}: ${e}`)
                if (priest) priest.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    startPriestLoop(priestID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startMageLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (mage) mage.disconnect()
                mage = await AL.Game.startMage(name, region, identifier)
                friends[2] = mage
                startMage(mage, merchantID, friends)
                startTrackerLoop(mage)
                mage.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`${name}: ${e}`)
                if (mage) mage.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    startMageLoop(mageID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startMerchantLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (merchant) merchant.disconnect()
                merchant = await AL.Game.startMerchant(name, region, identifier)
                friends[3] = merchant
                startMerchant(merchant, friends, { map: "main", x: -250, y: -100 })
                startTrackerLoop(merchant)
                merchant.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`${name}: ${e}`)
                if (merchant) merchant.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    startMerchantLoop(merchantID, options.region, options.identifier).catch(() => { /* ignore errors */ })
}
run()