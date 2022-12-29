import { Mage, MonsterName, PingCompensatedCharacter, Warrior } from "../../../../ALClient/build/index.js"
import { frankyIdlePosition } from "../../base/locations.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, MAGE_SPLASH, PRIEST_NORMAL, RANGER_NORMAL, WARRIOR_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

class MageFrankyAttackStrategy extends MageAttackStrategy {
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

class WarriorFrankyAttackStrategy extends WarriorAttackStrategy {
    public onApply(bot: Warrior): void {
        if (bot.isPVP()) {
            // No splash damage
            this.options.disableCleave = true
            this.options.ensureEquipped = { ...WARRIOR_NORMAL },
            delete this.options.enableEquipForCleave
        } else {
            // Splash damage & additional monsters
            delete this.options.disableCleave
            this.options.ensureEquipped = { ...WARRIOR_SPLASH },
            this.options.enableEquipForCleave = true
        }
    }
}

const frankyMoveStrategy = new ImprovedMoveStrategy("franky", { idlePosition: frankyIdlePosition })
const helperMons: MonsterName[] = ["nerfedmummy", "franky"]
const mainMons: MonsterName[] = ["franky", "nerfedmummy"]

export function constructFrankySetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "franky_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageFrankyAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: helperMons
                        }),
                        move: frankyMoveStrategy
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: mainMons
                        }),
                        move: frankyMoveStrategy
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorFrankyAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: helperMons
                        }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: mainMons
                        }),
                        move: frankyMoveStrategy
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorFrankyAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: helperMons
                        }),
                        move: frankyMoveStrategy
                    }
                ]
            }
        ]
    }
}

export function constructFrankyHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "franky_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({ contexts: contexts, ensureEquipped: { ...MAGE_SPLASH }, typeList: helperMons, hasTarget: true }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_paladin",
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({ contexts: contexts, typeList: helperMons, hasTarget: true }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({ contexts: contexts, ensureEquipped: { ...PRIEST_NORMAL }, disableAbsorb: true, typeList: helperMons, hasTarget: true }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({ contexts: contexts, ensureEquipped: { ...RANGER_NORMAL }, typeList: helperMons, hasTarget: true }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_rogue",
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({ contexts: contexts, typeList: helperMons, hasTarget: true }),
                        move: frankyMoveStrategy
                    }
                ]
            },
            {
                id: "franky_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({ contexts: contexts, disableAgitate: true, disableCleave: true, typeList: helperMons, hasTarget: true, ensureEquipped: { ...WARRIOR_SPLASH } }),
                        move: frankyMoveStrategy
                    }
                ]
            }
        ]
    }
}