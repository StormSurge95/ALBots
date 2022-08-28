import AL, { MonsterName } from "alclient"
import fs from "fs"
import { exit } from "process"

async function run() {
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData(true, true)])

    const monsters = AL.Game.G.monsters

    const monList = []

    for (const mon in monsters) {
        const mName = mon as MonsterName
        monList.push([mName, monsters[mName].attack])
    }

    monList.sort((a, b) => {
        return a[1] - b[1]
    })

    const strings = []

    strings.push("{\n")
    for (const mon of monList) {
        strings.push(`\t"${mon[0]}": {\n`)
        strings.push(`\t\t"attack": ${mon[1]},\n`)
        strings.push("\t}")
    }
    strings.push("}")

    const data = strings.join("")

    fs.writeFileSync("monsters.json", data)
}

run()

exit()