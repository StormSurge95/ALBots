import { Mage, PingCompensatedCharacter, /*Priest,*/ Warrior } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { SpecialMonsterMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

class MageSnowmanAttackStrategy extends MageAttackStrategy {
    public onApply(bot: Mage): void {
        if (bot.isPVP()) {
            // No splash damage
            this.options.ensureEquipped = { ...MAGE_NORMAL }
        } else {
            // Splash damage & additional monsters
            this.options.ensureEquipped = { ...MAGE_SPLASH }
        }
        super.onApply(bot)
    }
}

// class PriestSnowmanAttackStrategy extends PriestAttackStrategy {
//     public onApply(bot: Priest): void {
//         if (bot.isPVP()) {
//             this.options.ensureEquipped.orb = { name: "jacko", filters: { returnHighestLevel: true } }
//             this.options.ensureEquipped.ring1 = { name: "cring", filters: { returnHighestLevel: true } }
//         } else {
//             // Additional monsters
//             this.options.ensureEquipped.orb = { name: "jacko", filters: { returnHighestLevel: true } }
//             this.options.ensureEquipped.ring1 = { name: "zapper", filters: { returnHighestLevel: true } }
//         }
//         super.onApply(bot)
//     }
// }

class WarriorSnowmanAttackStrategy extends WarriorAttackStrategy {
    public onApply(bot: Warrior): void {
        if (bot.isPVP()) {
            // No Splash Damage
            this.options.disableCleave = true
            this.options.ensureEquipped = { ...WARRIOR_NORMAL }
            delete this.options.enableEquipForCleave
        } else {
            // Splash Damage & additional monsters
            delete this.options.disableCleave
            this.options.ensureEquipped = { ...WARRIOR_SPLASH }
            this.options.enableEquipForCleave = true
        }
        super.onApply(bot)
    }
}

const snowmanMoveStrategy = new SpecialMonsterMoveStrategy({ type: "snowman" })

export function constructSnowmanSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "snowman_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageSnowmanAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: ["snowman", "arcticbee"]
                        }),
                        move: snowmanMoveStrategy
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: ["snowman", "arcticbee"],
                        }),
                        move: snowmanMoveStrategy
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorSnowmanAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: ["snowman", "arcticbee"]
                        }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: ["snowman", "arcticbee"],
                        }),
                        move: snowmanMoveStrategy
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorSnowmanAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: ["snowman", "arcticbee"]
                        }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
        ]
    }
}

export function constructSnowmanHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "snowman_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({ contexts: contexts, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_paladin",
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({ contexts: contexts, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({ contexts: contexts, disableAbsorb: true, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({ contexts: contexts, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_rogue",
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({ contexts: contexts, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            },
            {
                id: "snowman_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({ contexts: contexts, disableAgitate: true, typeList: ["snowman", "arcticbee"] }),
                        move: snowmanMoveStrategy
                    }
                ]
            }
        ]
    }
}