import { Game, Pathfinder } from "../../ALClient/build/index.js"

async function run() {
    await Promise.all([Game.loginJSONFile("./credentials.json"), Game.getGData(true, false)])
    await Pathfinder.prepare(Game.G)

    console.log(Object.keys(Game.G))

    process.exit(0)
}

run()