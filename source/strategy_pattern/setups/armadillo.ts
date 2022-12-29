import { MonsterName, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_NORMAL, RANGER_NORMAL, WARRIOR_RANGED } from "./equipment.js"

export function constructArmadilloSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const monsters: MonsterName[] = ["armadillo", "phoenix"]
    return {
        configs: [
            {
                id: "armadillo_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: MAGE_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: PRIEST_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: RANGER_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: WARRIOR_RANGED
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            }
        ]
    }
}

export function constructArmadilloHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const monsters: MonsterName[] = ["armadillo", "phoenix"]
    return {
        configs: [
            {
                id: "armadillo_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: MAGE_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: PRIEST_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: RANGER_NORMAL
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            },
            {
                id: "armadillo_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: WARRIOR_RANGED
                        }),
                        move: new ImprovedMoveStrategy("armadillo")
                    }
                ]
            }
        ]
    }
}