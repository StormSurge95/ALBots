import AL, { Character, Constants, IPosition, Mage, Merchant, MonsterName, Pathfinder, Priest, ServerIdentifier, ServerRegion, Tools, Warrior } from "alclient"
import { calculateAttackLoopCooldown, goToPotionSellerIfLow, ITEMS_TO_CRAFT, ITEMS_TO_EXCHANGE, ITEMS_TO_HOLD, ITEMS_TO_SELL, LOOP_MS,
    moveInCircle, sleep, startAvoidStacking, startBuyFriendsReplenishablesLoop, startBuyLoop, startCompoundLoop, startCraftLoop, startElixirLoop,
    startExchangeLoop, startHealLoop, startLootLoop, startPartyLoop, startScareLoop, startSellLoop, startSendStuffDenylistLoop, startTrackerLoop, startUpgradeLoop } from "../base/general.js"
import { offsetPositionParty } from "../base/locations.js"
import { attackTheseTypesMage } from "../base/mage.js"
import { doBanking, goFishing, goMining, startMluckLoop } from "../base/merchant.js"
import { attackTheseTypesPriest, startDarkBlessingLoop, startPartyHealLoop } from "../base/priest.js"
import { attackTheseTypesWarrior, startChargeLoop, startHardshellLoop, startWarcryLoop } from "../base/warrior.js"
//import { startServer, addBot } from "../../../../ALUI/build/alui/index.js"
import { Command } from "commander"

/** Config */
const merchantID = "StormSurge"
const warriorID = "WarriorSurge"
const priestID = "PriestSurge"
const mageID = "MageSurge"

const partyLeader = "WarriorSurge"
const partyMembers = ["WarriorSurge", "PriestSurge", "MageSurge", "StormSurge"]

const huntables: MonsterName[] = ["goo", "squig", "grinch", "jr", "cutebee", "porcupine", "bee", "armadillo", "snake", "squigtoad", "osnake",
    "frog", "crab", "greenjr", "tortoise", "croc", "hen", "rooster", "mechagnome", "bat", "goldenbat", "wabbit", "arcticbee", "snowman",
    "spider", "rat", "scorpion", "pinkgoo", "gredpro", "gscorpion", "iceroamer", "minimush", "phoenix", "ghost", "nerfedmummy", "jrat",
    "crabx", "boar", "poisio", "tinyp", "a5", "mvampire", "wolfie", "prat", "bbpompom", "chestm", "cgoo", "stoneworm", "mummy", "wolf",
    "mole", "bigbird"]

let merchant: Merchant
let warrior: Warrior
let priest: Priest
let mage: Mage
const friends: Character[] = [undefined, undefined, undefined, undefined]
let targets: MonsterName[] = []
let location: IPosition = undefined
const monsterHunts: { hunter: string, id: MonsterName, count: number, time: { m: number, s: number, ms: number } }[] = [undefined, undefined, undefined]

const program = new Command()
program.option<ServerRegion>("-r, --region <server>", "The server region.", v => v as ServerRegion, "US")
program.option<ServerIdentifier>("-i, --identifier <name>", "The server identifier.", v => v as ServerIdentifier, "I")
program.option<MonsterName>("-t, --target <monster>", "The default target.", v => v as MonsterName, "spider")
program.parse(process.argv)
const options = program.opts()

function updateLocation(): void {
    location = Pathfinder.locateMonster(targets[0])[0]
}

async function startShared(bot: Character, merchantID: string, friends: Character[]): Promise<void> {
    startAvoidStacking(bot)
    startBuyLoop(bot)
    startHealLoop(bot)
    startLootLoop(bot, friends)
    if (bot.ctype == "merchant") {
        startUpgradeLoop(bot, ITEMS_TO_SELL)
        startCompoundLoop(bot, ITEMS_TO_SELL)
        startCraftLoop(bot, ITEMS_TO_CRAFT)
        startExchangeLoop(bot, ITEMS_TO_EXCHANGE)
        startSellLoop(bot)
    } else {
        startElixirLoop(bot, "elixirluck")
        if (bot.id == partyLeader) startSendStuffDenylistLoop(bot, [merchantID], ITEMS_TO_HOLD, 500_000)
        else startSendStuffDenylistLoop(bot, [partyLeader], ITEMS_TO_HOLD, 500_000)
    }
    if (bot.id == partyLeader) startPartyLoop(bot, partyLeader, partyMembers)
    else bot.timeouts.set("partyLoop", setTimeout(async () => { startPartyLoop(bot, partyLeader, partyMembers) }, 2000))

    while (location === undefined) {
        await sleep(10)
    }

    return
}

async function startWarrior(bot: Warrior, merchant: string, friends: Character[]) {
    await startShared(bot, merchant, friends)

    startChargeLoop(bot)
    startHardshellLoop(bot)
    startWarcryLoop(bot)
    startScareLoop(bot)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            if (targets[0] == "porcupine" && bot.slots.mainhand?.name !== "t2bow") {
                if (bot.slots.offhand?.name !== undefined) {
                    await bot.unequip("offhand")
                }
                const item = bot.locateItem("t2bow", bot.items, { returnHighestLevel: true })
                if (item !== undefined) await bot.equip(item, "mainhand")
            } else if (targets[0] !== "porcupine" && bot.slots.mainhand?.name == "t2bow") {
                const weapon = bot.locateItem("fireblade", bot.items, { returnHighestLevel: true })
                const shield = bot.locateItem("mshield", bot.items, { returnHighestLevel: true })
                if (weapon !== undefined) await bot.equip(weapon, "mainhand")
                if (shield !== undefined) await bot.equip(shield, "offhand")
            }

            const warTargs = bot.targets
            const priTargs = (priest) ? priest.targets : 0
            const magTargs = (mage) ? mage.targets : 0

            if (priTargs > 0 || magTargs > 0) {
                if (warTargs > 0) await attackTheseTypesWarrior(bot, huntables, friends, { targetingPartyMember: true })
                else await attackTheseTypesWarrior(bot, huntables, friends, { targetingPartyMember: true })
            } else {
                const maxTargets = (targets[0]) ? (huntables.indexOf(targets[0]) > 24 ? 3 : undefined) : undefined
                await attackTheseTypesWarrior(bot, targets, friends, { maximumTargets: maxTargets })
            }
        } catch (e) {
            console.error(`warrior: ${e}`)
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

            if (!bot.s.monsterhunt) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.getMonsterHuntQuest()
                console.log(`${bot.id} has a new MH Quest to hunt ${bot.s.monsterhunt.id} x${bot.s.monsterhunt.c}!`)
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            } else if (bot.s.monsterhunt.c <= 0) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.finishMonsterHuntQuest()
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            const radius = (targets[0].includes("snake")) ? 50 : (targets[0] === "prat" ? 80 : 150)
            await moveInCircle(bot, location, radius).catch(() => { /* */ })
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startPriest(bot: Priest, merchant: string, friends: Character[]) {
    await startShared(bot, merchant, friends)

    startDarkBlessingLoop(bot)
    startPartyHealLoop(bot, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            if (warrior.targets > 0)
                await attackTheseTypesPriest(bot, huntables, friends, { targetingPartyMember: true, disableGhostLifeEssenceFarm: true })
            else
                await attackTheseTypesPriest(bot, targets, friends)
        } catch (e) {
            console.error(`priest: ${e}`)
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

            if (!bot.s.monsterhunt) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.getMonsterHuntQuest()
                console.log(`${bot.id} has a new MH Quest to hunt ${bot.s.monsterhunt.id} x${bot.s.monsterhunt.c}!`)
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            } else if (bot.s.monsterhunt.c <= 0) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.finishMonsterHuntQuest()
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            const loc = offsetPositionParty(location, bot, 75)
            if (bot.targets > 0) {
                await bot.smartMove(loc, { avoidTownWarps: true }).catch(() => { /* */ })
            } else {
                await bot.smartMove(loc).catch(() => { /* */ })
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startMage(bot: Mage, merchant: string, friends: Character[]) {
    await startShared(bot, merchant, friends)

    async function attackLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip || bot.c.town) {
                bot.timeouts.set("attackLoop", setTimeout(async () => { attackLoop() }, LOOP_MS))
                return
            }

            if (warrior.targets > 0)
                await attackTheseTypesMage(bot, huntables, friends, { targetingPartyMember: true })
            else
                await attackTheseTypesMage(bot, targets, friends)
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
                await bot.smartMove("elixirluck", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goToPotionSellerIfLow(bot, 100, 100)

            if (!bot.s.monsterhunt) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.getMonsterHuntQuest()
                console.log(`${bot.id} has a new MH Quest to hunt ${bot.s.monsterhunt.id} x${bot.s.monsterhunt.c}!`)
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            } else if (bot.s.monsterhunt.c <= 0) {
                await bot.smartMove("monsterhunter", { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.finishMonsterHuntQuest()
                updateHunts()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            const loc = offsetPositionParty(location, bot, 75)
            if (bot.targets > 0) {
                await bot.smartMove(loc, { avoidTownWarps: true }).catch(() => { /* */ })
            } else {
                await bot.smartMove(loc).catch(() => { /* */ })
            }
        } catch (e) {
            console.error(`${bot.id}: ${e}`)
        }
        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
    }
    moveLoop()
}

async function startMerchant(bot: Merchant, friends: Character[], standPlace: IPosition): Promise<void> {
    await startShared(bot, bot.id, friends)

    startBuyFriendsReplenishablesLoop(bot, friends)
    startMluckLoop(bot)

    let lastBankVisit: number = Number.MIN_VALUE
    async function moveLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.rip) {
                await sleep(15000)
                await bot.respawn()
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, 1000))
                return
            }

            if (bot.isFull() || lastBankVisit < Date.now() - 120_000 || bot.hasPvPMarkedItem()) {
                lastBankVisit = Date.now()
                await bot.closeMerchantStand()
                await doBanking(bot)
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            if (bot.canUse("mluck", { ignoreCooldown: true })) {
                for (const friend of friends) {
                    if (!friend) continue
                    if (friend.id == bot.id) continue
                    if (!friend.s.mluck || !friend.s.mluck.strong || friend.s.mluck.f !== bot.id || friend.s.mluck.ms < 120_000) {
                        if (Tools.distance(bot, friend) > bot.G.skills.mluck.range) {
                            await bot.closeMerchantStand()
                            console.log(`[merchant] We are moving to ${friend.name} to mluck them!`)
                            await bot.smartMove(friend, { getWithin: bot.G.skills.mluck.range / 4 })
                        }

                        bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                        return
                    }
                }
            }

            if (warrior && (warrior.gold > 1_500_000 || warrior.isFull())) {
                await bot.closeMerchantStand()
                await bot.smartMove(warrior, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                lastBankVisit = Date.now()
                await doBanking(bot)
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            for (const item of ITEMS_TO_CRAFT) {
                if (bot.canCraft(item, { ignoreLocation: true })) {
                    const loc = Pathfinder.locateCraftNPC(item)
                    await bot.smartMove(loc, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                    return
                }
            }

            for (const item of ITEMS_TO_EXCHANGE) {
                if (bot.canExchange(item, { ignoreLocation: true })) {
                    await bot.closeMerchantStand()
                    await bot.smartMove(Pathfinder.locateExchangeNPC(item), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                    bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                    return
                }
            }

            if (bot.countItem("lostearring", bot.items, { level: 2 }) > 0) {
                await bot.closeMerchantStand()
                await bot.smartMove(Pathfinder.locateExchangeNPC("lostearring"), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            if (bot.countItem("monstertoken") > bot.G.tokens.monstertoken.funtoken) {
                await bot.closeMerchantStand()
                await bot.smartMove(Pathfinder.locateExchangeNPC("monstertoken"), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.buyWithTokens("funtoken", "monstertoken")
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            if (bot.countItem("funtoken") > bot.G.tokens.funtoken.rabbitsfoot) {
                await bot.closeMerchantStand()
                await bot.smartMove(Pathfinder.locateExchangeNPC("funtoken"), { getWithin: Constants.NPC_INTERACTION_DISTANCE / 4 })
                await bot.buyWithTokens("rabbitsfoot", "funtoken")
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goFishing(bot)
            if (bot.canUse("fishing", { ignoreEquipped: true })) {
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
                return
            }

            await goMining(bot)
            if (bot.canUse("mining", { ignoreEquipped: true })) {
                bot.timeouts.set("moveLoop", setTimeout(async () => { moveLoop() }, LOOP_MS))
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

function updateHunts() {
    if (warrior) {
        if (warrior.s?.monsterhunt) {
            const hunt = warrior.s.monsterhunt
            monsterHunts[0] = { hunter: warrior.id, id: hunt.id, count: hunt.c, time: getTime(hunt.ms) }
        }
    }
    if (priest) {
        if (priest.s?.monsterhunt) {
            const hunt = priest.s.monsterhunt
            monsterHunts[1] = { hunter: priest.id, id: hunt.id, count: hunt.c, time: getTime(hunt.ms) }
        }
    }
    if (mage) {
        if (mage.s?.monsterhunt) {
            const hunt = mage.s.monsterhunt
            monsterHunts[2] = { hunter: mage.id, id: hunt.id, count: hunt.c, time: getTime(hunt.ms) }
        }
    }
    monsterHunts.sort((a, b) => {
        if (a.time.m == b.time.m) {
            if (a.time.s == b.time.s) {
                if (a.time.ms == b.time.ms) {
                    return a.count - b.count
                }
                return a.time.ms - b.time.ms
            }
            return a.time.s - b.time.s
        }
        return a.time.m - b.time.m
    })
    updateTargets()
    console.log(targets)
    updateLocation()
    console.log(location)
}

function getTime(ms: number): { m: number, s: number, ms: number} {
    const millis = ms % 1000
    const newMS = ms - millis
    let seconds: number = newMS / 1000
    const s = seconds % 60
    seconds -= s
    const minutes = seconds / 60
    return { m: minutes, s: s, ms: millis }
}

function updateTargets(): void {
    targets = []
    for (const hunt of monsterHunts) {
        if (hunt !== undefined && huntables.includes(hunt.id)) {
            targets.push(hunt.id)
        }
    }
    if (targets.length == 0) targets.push(options.target)
}

async function run() {
    // Login and prepare pathfinding
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData(true, false)])
    await AL.Pathfinder.prepare(AL.Game.G)

    //await startServer(8080)

    // Start all characters
    console.log("Connecting...")

    const startWarriorLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        // Start warrior
        const loopBot = async () => {
            try {
                if (warrior) warrior.disconnect()
                warrior = await AL.Game.startWarrior(name, region, identifier)
                friends[0] = warrior
                startWarrior(warrior, merchantID, friends)
                startTrackerLoop(warrior)
                //addBot(warriorID, warrior.socket, warrior)
                warrior.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(e)
                if (warrior) warrior.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, AL.Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Warrior...")
    startWarriorLoop(warriorID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    const startPriestLoop = async (name: string, region: ServerRegion, identifier: ServerIdentifier) => {
        // Start priest
        const loopBot = async () => {
            try {
                if (priest) priest.disconnect()
                priest = await AL.Game.startPriest(name, region, identifier)
                friends[1] = priest
                startPriest(priest, merchantID, friends)
                startTrackerLoop(priest)
                //addBot(priestID, priest.socket, priest)
                priest.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(e)
                if (priest) priest.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, AL.Constants.RECONNECT_TIMEOUT_MS)
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
                mage = await AL.Game.startMage(name, region, identifier)
                friends[2] = mage
                startMage(mage, merchantID, friends)
                startTrackerLoop(mage)
                //addBot(mageID, mage.socket, mage)
                mage.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(e)
                if (mage) mage.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, AL.Constants.RECONNECT_TIMEOUT_MS)
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
                merchant = await AL.Game.startMerchant(name, region, identifier)
                friends[3] = merchant
                startMerchant(merchant, friends, { map: "main", x: -250, y: -100 })
                startTrackerLoop(merchant)
                //addBot(merchantID, merchant.socket, merchant)
                merchant.socket.on("disconnect", async () => { loopBot() })
            } catch (e) {
                console.error(e)
                if (merchant) merchant.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(async () => { loopBot() }, 2000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(async () => { loopBot() }, AL.Constants.RECONNECT_TIMEOUT_MS)
                else setTimeout(async () => { loopBot() }, 10000)
            }
        }
        loopBot()
    }
    console.log("Starting Merchant...")
    startMerchantLoop(merchantID, options.region, options.identifier).catch(() => { /* ignore errors */ })

    await sleep(2000)

    const startMHLogLoop = async () => {
        const mhLogLoop = () => {
            try {
                updateHunts()
                console.log(monsterHunts)
                setTimeout(() => { mhLogLoop() }, 60000)
            } catch (e) {
                console.error(e)
                setTimeout(() => { mhLogLoop() }, 1000)
            }
        }
        mhLogLoop()
    }
    await sleep(10000)
    startMHLogLoop().catch(() => { /* ignore errors */ })
}
run()