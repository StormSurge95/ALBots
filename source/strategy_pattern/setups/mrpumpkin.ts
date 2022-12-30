import { Mage, MonsterName, PingCompensatedCharacter, Priest, Warrior } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

const NON_PVP_MONSTERS: MonsterName[] = ["mrpumpkin", "phoenix", "xscorpion", "minimush", "tinyp"]

class MageMrPumpkinAttackStrategy extends MageAttackStrategy {
    public onApply(bot: Mage): void {
        super.onApply(bot)
        if (bot.isPVP()) {
            // No splash damage
            this.options.ensureEquipped = { ...MAGE_NORMAL }
            this.options.typeList = ["mrpumpkin"]
            delete this.options.enableGreedyAggro
        } else {
            this.options.ensureEquipped = { ...MAGE_SPLASH }
            this.options.typeList = NON_PVP_MONSTERS
            this.options.enableGreedyAggro = true
        }
    }
}

class PriestMrPumpkinAttackStrategy extends PriestAttackStrategy {
    public onApply(bot: Priest): void {
        super.onApply(bot)
        if (bot.isPVP()) {
            this.options.typeList = ["mrpumpkin"]
            delete this.options.enableGreedyAggro
        } else {
            this.options.typeList = NON_PVP_MONSTERS
            this.options.enableGreedyAggro = true
        }
    }
}

class WarriorMrPumpkinAttackStrategy extends WarriorAttackStrategy {
    public onApply(bot: Warrior): void {
        super.onApply(bot)
        if (bot.isPVP()) {
            this.options.ensureEquipped = { ...WARRIOR_NORMAL }
            this.options.disableCleave = true
            delete this.options.enableEquipForCleave
            delete this.options.enableGreedyAggro
            this.options.typeList = ["mrpumpkin"]
        } else {
            delete this.options.disableCleave
            this.options.ensureEquipped = { ...WARRIOR_SPLASH }
            this.options.enableEquipForCleave = true
            this.options.enableGreedyAggro = true
            this.options.typeList = NON_PVP_MONSTERS
        }
    }
}

export function constructMrPumpkinSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const moveStrat = new ImprovedMoveStrategy("mrpumpkin", { idlePosition: { map: "halloween", x: -250, y: 725 } })

    return {
        configs: [
            {
                id: "mrpumpkin_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageMrPumpkinAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            disableZapper: true,
                            ensureEquipped: { ...MAGE_NORMAL }
                        }),
                        move: moveStrat
                    },
                    {
                        ctype: "priest",
                        attack: new PriestMrPumpkinAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL }
                        }),
                        move: moveStrat
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorMrPumpkinAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...WARRIOR_NORMAL }
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "mrpumpkin_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestMrPumpkinAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL }
                        }),
                        move: moveStrat
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorMrPumpkinAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...WARRIOR_NORMAL }
                        }),
                        move: moveStrat
                    }
                ]
            }
        ]
    }
}

export function constructMrPumpkinHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "mrpumpkin_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({ contexts: contexts, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            },
            {
                id: "mrpumpkin_paladin",
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({ contexts: contexts, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            },
            {
                id: "mrpumpkin_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({ contexts: contexts, disableAbsorb: true, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            },
            {
                id: "mrpumpkin_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({ contexts: contexts, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            },
            {
                id: "mrpumpkin_rogue",
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({ contexts: contexts, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            },
            {
                id: "mrpumpkin_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({ contexts: contexts, disableAgitate: true, disableCleave: true, type: "mrpumpkin", hasTarget: true }),
                        move: new ImprovedMoveStrategy("mrpumpkin")
                    }
                ]
            }
        ]
    }
}