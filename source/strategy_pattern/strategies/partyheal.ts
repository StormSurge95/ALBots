import { PingCompensatedCharacter, Priest } from "../../../../ALClient/build/index.js"
import { Loop, LoopName, Strategist, Strategy } from "../context.js"

export type PartyHealStrategyOptions = {
    /** When to heal */
    healWhenLessThan: {
        /**
         * Heal when a context's bot goes below this hp value.
         *
         * NOTE: If there is a context with max_hp lower than this, we will spend all of our mp party healing...
         */
        hp?: number
        /** Heal when a context's bot is missing more than this amount of hp */
        hpMissing?: number
        /** Heal when a context's bot goes below the ratio `bot.hp / bot.max_hp` */
        hpRatio?: number
    }
}

export const DEFAULT_PARTY_HEAL_STRATEGY_OPTIONS: PartyHealStrategyOptions = {
    healWhenLessThan: {
        hpRatio: 0.5
    }
}

export class PartyHealStrategy implements Strategy<Priest> {
    public loops = new Map<LoopName, Loop<Priest>>()

    protected contexts: Strategist<PingCompensatedCharacter>[]
    protected options: PartyHealStrategyOptions

    public constructor(contexts: Strategist<PingCompensatedCharacter>[], options = DEFAULT_PARTY_HEAL_STRATEGY_OPTIONS) {
        this.contexts = contexts

        if (Object.values(options.healWhenLessThan).every(v => v === undefined)) {
            throw new Error("Please set one of the paramaters in `healWhenLessThan`.")
        }
        this.options = options

        this.loops.set("partyheal", {
            fn: async (bot: Priest) => { await this.partyHeal(bot) },
            interval: ["partyheal"]
        })
    }

    private async partyHeal(bot: Priest) {
        if (bot.rip) return
        if (!bot.canUse("partyheal")) return

        for (const context of this.contexts) {
            if (!context.isReady()) continue
            const friend = context.bot
            if (!friend || !friend.ready || friend.socket.disconnected || friend.rip) continue

            if (
                (friend.hp < (this.options.healWhenLessThan.hp ?? 0))
                || ((friend.hp / friend.max_hp) < (this.options.healWhenLessThan.hpRatio ?? 0))
                || ((friend.max_hp - friend.hp) > (this.options.healWhenLessThan.hpMissing ?? Number.MAX_SAFE_INTEGER))
            ) {
                return bot.partyHeal().catch(bot.error)
            }
        }
    }
}