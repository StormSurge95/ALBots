import { MonsterName, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, RANGER_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

export function constructGigaCrabSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const monsters: MonsterName[] = ["crabx", "crabxx"]
    const moveStrategy = new ImprovedMoveStrategy(monsters)

    return {
        configs: [
            {
                id: "crabxx_mage,priest,warrior",
                characters: [
                    // The mage will prioritize crabx so that the giga crab can take damage
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true, // Giga crab will only take 1 damage while any crabx are alive, so help kill others' too
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrategy
                    },
                    // The priest will tank the giga crab
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: ["crabxx", "crabx"]
                        }),
                        move: new ImprovedMoveStrategy("crabxx")
                    },
                    // The warrior will prioritize crabx so that the giga crab can take damage
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true, // Giga crab will only take 1 damage while any crabx are alive, so help kill others' too
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrategy
                    }
                ]
            },
            {
                id: "crabxx_ranger,priest,warrior",
                characters: [
                    // The ranger will prioritize crabx so that the giga crab can take damage
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            disableEnergize: true,
                            ensureEquipped: { ...RANGER_NORMAL },
                            typeList: monsters
                        }),
                        move: moveStrategy
                    },
                    // The priest will tank the giga crab
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: ["crabxx", "crabx"]
                        }),
                        move: new ImprovedMoveStrategy("crabxx")
                    },
                    // The warrior will prioritize crabx so that the giga crab can take damage
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrategy
                    }
                ]
            },
            {
                id: "crabxx_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: ["crabxx", "crabx"]
                        }),
                        move: new ImprovedMoveStrategy("crabxx")
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrategy
                    }
                ]
            }
        ]
    }
}

export function constructGigaCrabHelpersSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const monsters: MonsterName[] = ["crabx", "crabxx"]
    const moveStrat = new ImprovedMoveStrategy(monsters)

    return {
        configs: [
            {
                id: "crabxx_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "crabxx_paladin",
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "crabxx_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableAbsorb: true,
                            disableCreditCheck: true,
                            enableHealStrangers: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "crabxx_ranger",
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            ensureEquipped: { ...RANGER_NORMAL },
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "crabxx_rogue",
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({
                            contexts: contexts,
                            disableCreditCheck: true,
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            },
            {
                id: "crabxx_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableAgitate: true,
                            disableCleave: true,
                            disableCreditCheck: true,
                            enableEquipForStomp: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: monsters
                        }),
                        move: moveStrat
                    }
                ]
            }
        ]
    }
}