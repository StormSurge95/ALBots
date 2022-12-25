import { Mage, Pathfinder, PingCompensatedCharacter, Tools } from "../../../../ALClient/build/index.js"
import { Loop, LoopName, Strategist, Strategy } from "../context.js"

export type MagiportStrategyOptions = {
    delayMS: number
    range: number
}

export const DefaultMagiportStrategyOptions: MagiportStrategyOptions = {
    /** Don't magiport the same bot within this interval (in ms) */
    delayMS: 5000,
    /** Offer magiports to those smart moving within this range of us */
    range: 100
}

export class MagiportStrategy implements Strategy<Mage> {
    public loops = new Map<LoopName, Loop<PingCompensatedCharacter>>()

    protected contexts: Strategist<PingCompensatedCharacter>[]
    protected options: MagiportStrategyOptions

    protected recentlyMagiported = new Map<string, number>()

    public constructor(contexts: Strategist<PingCompensatedCharacter>[], options = DefaultMagiportStrategyOptions) {
        this.contexts = contexts
        this.options = options

        this.loops.set("magiport", {
            fn: async (bot: Mage) => { await this.magiport(bot) },
            interval: ["magiport"]
        })
    }

    protected async magiport(bot: Mage) {
        if (!bot.canUse("magiport")) return // We can't magiport anyone
        if (bot.smartMoving) return // We're currently moving somewhere

        for (const context of this.contexts) {
            if (!context.isReady()) continue
            const friend = context.bot
            if (friend.id == bot.id) continue // It's us
            if (!friend.smartMoving) continue // They're not smart moving
            if (Pathfinder.canWalkPath(bot, friend)) continue // They can walk to us
            if (Tools.distance(bot, friend.smartMoving) > this.options.range) continue // They're not smart moving to a place near us

            const lastMagiport = this.recentlyMagiported.get(friend.id)
            if (lastMagiport && lastMagiport + this.options.delayMS > Date.now()) continue // We recently magiported them

            // Offer the magiport
            try {
                await bot.magiport(friend.id)
                this.recentlyMagiported.set(friend.id, Date.now())
                await friend.acceptMagiport(bot.id)
                await friend.stopSmartMove()
                await friend.stopWarpToTown()
            } catch (e) {
                bot.error(e)
            }
        }
    }
}