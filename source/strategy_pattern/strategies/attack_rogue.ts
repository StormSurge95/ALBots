import { Rogue } from "../../../../ALClient/build/index.js"
import { BaseAttackStrategy, BaseAttackStrategyOptions } from "./attack.js"

export type RogueAttackStrategyOptions = BaseAttackStrategyOptions & {
    disableQuickPunch?: true
    disableQuickStab?: true
}

export class RogueAttackStrategy extends BaseAttackStrategy<Rogue> {
    public options: RogueAttackStrategyOptions

    public constructor(options?: RogueAttackStrategyOptions) {
        super(options)

        if (!this.options.disableQuickPunch) this.interval.push("quickpunch")
        if (!this.options.disableQuickStab) this.interval.push("quickstab")
    }

    // TODO: Implement rogue special strategies
}