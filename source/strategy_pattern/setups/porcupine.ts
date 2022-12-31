import { PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, RANGER_NORMAL, WARRIOR_RANGED } from "./equipment.js"

export function constructPorcupineSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "porcupine_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...MAGE_SPLASH },
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...RANGER_NORMAL },
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableAgitate: true,
                            disableCleave: true,
                            ensureEquipped: { ...WARRIOR_RANGED },
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            }
        ]
    }
}

export function constructPorcupineHelperSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "porcupine_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            },
            {
                id: "porcupine_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableAgitate: true,
                            disableCleave: true,
                            ensureEquipped: { ...WARRIOR_RANGED },
                            type: "porcupine"
                        }),
                        move: new ImprovedMoveStrategy("porcupine")
                    }
                ]
            }
        ]
    }
}