import { Game, Pathfinder, MonsterName } from "alclient"

const type = process.argv[2] as MonsterName

async function run() {
    await Promise.all([Game.loginJSONFile("./credentials.json"), Game.getGData(true, true)])
    await Pathfinder.prepare(Game.G)

    console.log(Pathfinder.locateMonster(type))

    process.exit(0)
}

run()