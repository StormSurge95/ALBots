import AL, { MonsterName } from "../../ALClient/build/index.js"
import { sleep, startDebugLoop, startTrackerLoop, writeLast1000Events } from "./base/general.js"
import { partyLeader, partyMembers } from "./base/party.js"
import { Information } from "./definitions/bot.js"
import { preparePriest, prepareRanger, prepareWarrior } from "./master.js"
import { startMerchant } from "./base/shared.js"
import { Command } from "commander"
import { merchantStrategy } from "./strategies.js"

const program = new Command()
program.option<MonsterName>("-t, --target <monster>", "The target monster.", v => v as MonsterName)
program.option("-h, --monsterhunt", "whether to monsterhunt", false)
program.parse(process.argv)
const options = program.opts()

const information: Information = {
    friends: [undefined, undefined, undefined, undefined],
    tank: {
        bot: undefined,
        name: "WarriorSurge",
        target: undefined
    },
    healer: {
        bot: undefined,
        name: "PriestSurge",
        target: undefined
    },
    dps: {
        bot: undefined,
        name: "RangerSurge",
        target: undefined
    },
    merchant: {
        bot: undefined,
        name: "StormSurge",
        target: undefined
    }
}

async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData(true, false)])
    await AL.Pathfinder.prepare(AL.Game.G)

    console.log("Connecting...")

    const startMerchantLoop = async () => {
        const loopBot = async () => {
            try {
                if (information.merchant.bot) information.merchant.bot.disconnect()
                information.merchant.bot = await AL.Game.startMerchant(information.merchant.name, "US", "III")
                information.friends[0] = information.merchant.bot
                startMerchant(information.merchant.bot, merchantStrategy, information, { map: "main", x: -250, y: -100 }, partyLeader, partyMembers)
                startTrackerLoop(information.merchant.bot)
                information.merchant.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(`[merchant]: ${e}`)
                if (information.merchant.bot) information.merchant.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10_000)
            }
        }
        loopBot().catch(console.error)
    }
    console.log("Starting merchant...")
    startMerchantLoop().catch(() => { /* */ })

    let ind = 0
    const startWarriorLoop = async () => {
        const loopBot = async () => {
            try {
                if (information.tank.bot) information.tank.bot.disconnect()
                information.tank.bot = await AL.Game.startWarrior(information.tank.name, "US", "III")
                information.friends[1] = information.tank.bot
                prepareWarrior(information.tank.bot, information, partyLeader, partyMembers, { monsterhunt: options.monsterhunt, defaultTarget: options.target })
                startTrackerLoop(information.tank.bot)
                startDebugLoop(information.tank.bot, false, 1000)
                information.tank.bot.socket.on("game_error", async () => {
                    await sleep(50)
                    writeLast1000Events(information.tank.bot, `${information.tank.bot.id}_game_error_${ind}.json`)
                    ind = (ind >= 10) ? ind % 10 : ind + 1
                })
                information.tank.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(`[warrior]: ${e}`)
                if (information.tank.bot) information.tank.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10_000)
            }
        }
        loopBot().catch(console.error)
    }
    console.log("Starting warrior...")
    startWarriorLoop().catch(() => { /* */ })

    const startPriestLoop = async () => {
        const loopBot = async () => {
            try {
                if (information.healer.bot) information.healer.bot.disconnect()
                information.healer.bot = await AL.Game.startPriest(information.healer.name, "US", "III")
                information.friends[2] = information.healer.bot
                preparePriest(information.healer.bot, information, partyLeader, partyMembers, { monsterhunt: options.monsterhunt, defaultTarget: options.target })
                startTrackerLoop(information.healer.bot)
                information.healer.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(`[priest]: ${e}`)
                if (information.healer.bot) information.healer.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    console.log("Starting priest...")
    startPriestLoop().catch(() => { /* */ })

    const startRangerLoop = async () => {
        const loopBot = async () => {
            try {
                if (information.dps.bot) information.dps.bot.disconnect()
                information.dps.bot = await AL.Game.startRanger(information.dps.name, "US", "III")
                information.friends[3] = information.dps.bot
                prepareRanger(information.dps.bot, information, partyLeader, partyMembers, { monsterhunt: options.monsterhunt, defaultTarget: options.target })
                startTrackerLoop(information.dps.bot)
                information.dps.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(`[ranger]: ${e}`)
                if (information.dps.bot) information.dps.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    console.log("Starting ranger...")
    startRangerLoop().catch(() => { /* */ })
}
run().catch(console.error)