import { Character, Constants, Game, IPosition, Mage, Merchant, MonsterName, Pathfinder, Priest, ServerIdentifier, ServerRegion, Tools, Warrior } from "alclient"
import { calculateAttackLoopCooldown, getTotalTargets, goToPotionSellerIfLow, ITEMS_TO_COMPOUND, ITEMS_TO_CRAFT, ITEMS_TO_EXCHANGE, ITEMS_TO_HOLD, ITEMS_TO_SELL,
    ITEMS_TO_UPGRADE, LOOP_MS, moveInCircle, sleep, startAvoidStacking, startBuyFriendsReplenishablesLoop, startBuyLoop, startCompoundLoop, startCraftLoop, startElixirLoop,
    startExchangeLoop, startHealLoop, startLootLoop, startPartyLoop, startSellLoop, startSendStuffDenyListLoop, startTrackerLoop, startUpgradeLoop } from "../base/general.js"
import { locations, offsetPositionParty } from "../base/locations.js"
import { attackTheseTypesMage } from "../base/mage.js"
import { startMluckLoop, doBanking, goFishing, goMining } from "../base/merchant.js"
import { startDarkBlessingLoop, startPartyHealLoop, attackTheseTypesPriest } from "../base/priest.js"
import { startChargeLoop, startHardshellLoop, startWarcryLoop, attackTheseTypesWarrior } from "../base/warrior.js"
import { Command } from "commander"

/** Config **/
const program = new Command()

const merchantID = "StormSurge"
const warriorID = "WarriorSurge"
const priestID = "PriestSurge"
const mageID = "MageSurge"

const partyLeader = warriorID
const partyMembers = [warriorID, priestID, mageID, merchantID]

let warrior: Warrior
let priest: Priest
let mage: Mage
let merchant: Merchant
const friends: Character[] = [undefined, undefined, undefined, undefined]

program
    .requiredOption<MonsterName[]>("-t, --targets <monsters...>", "list of targets to farm", (v: string, p: MonsterName[] = []) => p.concat(v as MonsterName))
    .option("-m, --move", "whether to move in a circle or stand in place", false)
    .option("-z, --zone <mine>", "the mining zone to mine in", "M1")
    .option("-c, --circle <radius>", "the radius for the circle to move in", parseInt)
    .option("--max <maximum>", "the maximum number of targets to purposefully aggro", parseInt, undefined)
    .option<ServerRegion>("-r, --region <reg>", "the server region to use", v => v as ServerRegion, "US")
    .option<ServerIdentifier>("-i, --identifier <id>", "the server identifier to use", v => v as ServerIdentifier, "I")
program.parse(process.argv)
const options = program.opts()
console.log(options)
const location = locations[options.targets[0]][0]
/** End Config **/

async function startShared(bot: Character, merchantID: string, friends: Character[]): Promise<void> {
    startBuyLoop(bot)
    startHealLoop(bot)
    if (bot.ctype !== "merchant") {
        startAvoidStacking(bot)
        startLootLoop(bot, friends)
        startElixirLoop(bot, "elixirluck")
        if (bot.id == partyLeader) startSendStuffDenyListLoop(bot, [merchantID], ITEMS_TO_HOLD, 500_000)
        else startSendStuffDenyListLoop(bot, [partyLeader], ITEMS_TO_HOLD, 500_000)
    }
    if (bot.id == partyLeader) startPartyLoop(bot, partyLeader, partyMembers)
    else bot.timeouts.set("partyLoop", setTimeout(async () => { startPartyLoop(bot, partyLeader, partyMembers) }, 2000))
}

async function startWarrior(bot: Warrior, merchant: string, friends: Character[]) {
    startShared(bot, merchant, friends)

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

            const warTargs = getTotalTargets(warrior)
            const priTargs = (priest) ? getTotalTargets(priest) : 0
            const magTargs = (mage) ? getTotalTargets(mage) : 0

            if (priTargs > 0 || magTargs > 0) {
                if (warTargs > 0) await attackTheseTypesWarrior(bot, undefined, friends, { targetingMe: false, targetingPartyMember: true })
                else await attackTheseTypesWarrior(bot, undefined, friends, { targetingPartyMember: true })
            } else {
                await attackTheseTypesWarrior(bot, options.targets, friends, { maximumTargets: options.max })
            }
        } catch (e) {
            console.error(`[warrior]: ${e}`)
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
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            if (options.move) await moveInCircle(bot, location, options.circle)
            else await bot.smartMove(location)
        } catch (e) {
            console.error(`[warrior]: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startPriest(bot: Priest, merchant: string, friends: Character[]) {
    startShared(bot, merchant, friends)

    startDarkBlessingLoop(bot)
    startPartyHealLoop(bot, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            await attackTheseTypesPriest(bot, undefined, friends, { targetingPartyMember: true, disableGhostLifeEssenceFarm: true })
        } catch (e) {
            console.error(`[priest]: ${e}`)
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
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            const loc = offsetPositionParty(location, bot, 75)
            await bot.smartMove(loc).catch(() => { /* ignore errors */ })
        } catch (e) {
            console.error(`[priest]: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startMage(bot: Mage, merchant: string, friends: Character[]) {
    startShared(bot, merchant, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            await attackTheseTypesMage(bot, undefined, friends, { targetingPartyMember: true })
        } catch (e) {
            console.error(`[mage]: ${e}`)
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
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            const loc = offsetPositionParty(location, bot, 75)
            await bot.smartMove(loc).catch(() => { /* ignore errors */ })
        } catch (e) {
            console.error(`[mage]: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startMerchant(bot: Merchant, friends: Character[], standPlace: IPosition): Promise<void> {
    startShared(bot, bot.id, friends)

    startBuyFriendsReplenishablesLoop(bot, friends)
    startUpgradeLoop(bot, ITEMS_TO_SELL, ITEMS_TO_UPGRADE)
    startCompoundLoop(bot, ITEMS_TO_SELL, ITEMS_TO_COMPOUND)
    startCraftLoop(bot, ITEMS_TO_CRAFT)
    startExchangeLoop(bot, ITEMS_TO_EXCHANGE)
    startSellLoop(bot)
    startMluckLoop(bot)

    let lastBankVisit = 0
    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, 1000))
                return
            }

            if (bot.isFull() || lastBankVisit < (Date.now() - 300000) || bot.hasPvPMarkedItem()) {
                lastBankVisit = Date.now()
                await bot.closeMerchantStand().catch(() => { /* */ })
                console.log("[merchant]: doing banking...")
                await doBanking(bot)
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            if (bot.canUse("mluck", { ignoreCooldown: true })) {
                for (const friend of friends) {
                    if (!friend) continue
                    if (friend.id == bot.id) continue
                    if (!friend.s.mluck || !friend.s.mluck.strong || friend.s.mluck.f !== bot.id || friend.s.mluck.ms < 120_000) {
                        if (Tools.distance(bot, friend) > bot.G.skills.mluck.range) {
                            await bot.closeMerchantStand().catch(() => { /* */ })
                            console.log(`[merchant] We are moving to ${friend.name} to mluck them!`)
                            await bot.smartMove(friend, { getWithin: bot.G.skills.mluck.range / 2, avoidTownWarps: true })
                        }

                        bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                        return
                    }
                }
            }

            if (warrior && (warrior.gold > 1_500_000 || warrior.isFull())) {
                await bot.closeMerchantStand().catch(() => { /* */ })
                console.log("[merchant]: moving to warrior...")
                await bot.smartMove(warrior, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            for (const item of ITEMS_TO_CRAFT) {
                if (bot.canCraft(item, { ignoreLocation: true })) {
                    const loc = Pathfinder.locateCraftNPC(item)
                    await bot.closeMerchantStand().catch(() => { /* */ })
                    console.log(`[merchant]: crafting ${item}...`)
                    await bot.smartMove(loc, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                    return
                }
            }

            for (const item of ITEMS_TO_EXCHANGE) {
                if (bot.canExchange(item, { ignoreLocation: true })) {
                    await bot.closeMerchantStand().catch(() => { /* */ })
                    console.log(`[merchant]: exchanging ${item}...`)
                    await bot.smartMove(Pathfinder.locateExchangeNPC(item), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    bot.timeouts.set("moveLoop", setTimeout(moveLoop, bot.q.exchange?.ms ?? LOOP_MS))
                    return
                }
            }
            if (bot.q.exchange) {
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, bot.q.exchange.ms))
                return
            }

            if (bot.canUse("fishing", { ignoreEquipped: true })) {
                console.log("[merchant]: going fishing...")
                await goFishing(bot)
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            if (bot.canUse("mining", { ignoreEquipped: true })) {
                console.log("[merchant]: going mining...")
                await goMining(bot, "M1")
                bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
                return
            }

            await bot.smartMove(standPlace, { avoidTownWarps: true })
            await bot.openMerchantStand()
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }

        bot.timeouts.set("moveLoop", setTimeout(moveLoop, LOOP_MS))
    }
    moveLoop()
}

async function run() {
    console.log("Connecting...")

    await Promise.all([Game.loginJSONFile("./credentials.json"), Game.getGData(true, false)])
    await Pathfinder.prepare(Game.G)

    const startWarriorLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (warrior) warrior.disconnect()
                warrior = await Game.startWarrior(name, region, identifier)
                friends[0] = warrior
                startWarrior(warrior, merchantID, friends)
                startTrackerLoop(warrior)
                warrior.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`[warrior]: ${e}`)
                if (warrior) warrior.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Warrior...")
    startWarriorLoop(warriorID, options.region, options.identifier).catch(() => { /* */ })

    const startPriestLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        const loopBot = async () => {
            try {
                if (priest) priest.disconnect()
                priest = await Game.startPriest(name, region, identifier)
                friends[1] = priest
                startPriest(priest, merchantID, friends)
                startTrackerLoop(priest)
                priest.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`[priest]: ${e}`)
                if (priest) priest.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Priest...")
    startPriestLoop(priestID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startMageLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        // Start ranger
        const loopBot = async () => {
            try {
                if (mage) mage.disconnect()
                mage = await Game.startMage(name, region, identifier)
                friends[2] = mage
                startMage(mage, merchantID, friends)
                startTrackerLoop(mage)
                mage.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`[mage]: ${e}`)
                if (mage) mage.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Mage...")
    startMageLoop(mageID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startMerchantLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        // Start merchant
        const loopBot = async () => {
            try {
                if (merchant) merchant.disconnect()
                merchant = await Game.startMerchant(name, region, identifier)
                friends[3] = merchant
                startMerchant(merchant, friends, { map: "main", x: -250, y: -100 })
                startTrackerLoop(merchant)
                merchant.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(`[merchant]: ${e}`)
                if (merchant) merchant.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Merchant...")
    startMerchantLoop(merchantID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    console.log(`Starting ${options.targets[0]} farm...`)
}

run()