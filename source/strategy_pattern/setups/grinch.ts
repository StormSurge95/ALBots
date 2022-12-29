import { MonsterName, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { SpecialMonsterMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_LUCK, WARRIOR_NORMAL } from "./equipment.js"

const grinchMoveStrat = new SpecialMonsterMoveStrategy({ ignoreMaps: ["bank", "bank_b", "bank_u", "hut", "woffice"], type: "grinch" })
const typeList: MonsterName[] = ["grinch"]

export function contructGrinchSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "grinch_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_NORMAL },
                            typeList: typeList
                        }),
                        move: grinchMoveStrat
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            typeList: typeList
                        }),
                        move: grinchMoveStrat
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            typeList: typeList
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            typeList: typeList
                        }),
                        move: grinchMoveStrat
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            typeList: typeList
                        }),
                        move: grinchMoveStrat
                    }
                ]
            }
        ]
    }
}

export function constructGrinchHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "grinch_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_paladin",
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({
                            contexts: contexts,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableAbsorb: true,
                            enableHealStrangers: true,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_rogue",
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({
                            contexts: contexts,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            },
            {
                id: "grinch_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableAgitate: true,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            typeList: typeList,
                            hasTarget: true
                        }),
                        move: grinchMoveStrat
                    }
                ]
            }
        ]
    }
}