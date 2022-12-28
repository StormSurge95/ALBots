import { Character } from "../../../../ALClient/build/index.js"
import { sleep } from "../../base/general.js"
import { Loop, LoopName, Strategy } from "../context.js"

export class RespawnStrategy<Type extends Character> implements Strategy<Type> {
    public loops = new Map<LoopName, Loop<Type>>()

    public constructor() {
        this.loops.set("respawn", {
            fn: async (bot: Type) => { await this.respawnIfDead(bot) },
            interval: 1000
        })
    }

    private async respawnIfDead(bot: Type) {
        if (!bot.rip) return

        await sleep(15_000)

        return bot.respawn().catch(bot.error)
    }
}