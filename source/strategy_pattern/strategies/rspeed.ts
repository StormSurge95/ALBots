import { PlayerModel, Rogue } from "../../../../ALClient/build/index.js"
import { Loop, LoopName, Strategy } from "../context.js"

// TODO: Add options to toggle whether or not we should give to everyone, just friends, etc.

export class GiveRogueSpeedStrategy implements Strategy<Rogue> {
    public loops = new Map<LoopName, Loop<Rogue>>()

    public constructor() {
        this.loops.set("rspeed", {
            fn: async (bot: Rogue) => {
                await this.giveRogueSpeedToSelf(bot)
                await this.giveRogueSpeedToOthers(bot)
            },
            interval: ["rspeed"]
        })
    }

    private async giveRogueSpeedToSelf(bot: Rogue) {
        if (bot.s.rspeed?.ms > 30_000) return // We have rspeed already
        if (!bot.canUse("rspeed")) return // can't use rspeed

        // Give rogue speed to ourself
        return bot.rspeed(bot.id).catch(bot.error)
    }

    private async giveRogueSpeedToOthers(bot: Rogue) {
        if (!bot.canUse("rspeed")) return // can't use

        for (const player of bot.getPlayers({
            isNPC: false,
            withinRange: "rspeed"
        })) {
            if (player.s.rspeed?.ms > 300_000) continue // Already has rspeed

            // Give rspeed to the player
            await bot.rspeed(player.id).catch(bot.error)
            return PlayerModel.updateOne({ name: player.id }, { s: player.s }).catch(bot.error)
        }
    }
}