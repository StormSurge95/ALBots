import { Pathfinder, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy, MoveInCircleMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { PRIEST_LUCK, WARRIOR_NORMAL, MAGE_NORMAL } from "./equipment.js"

export function constructBScorpionSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const spawn = Pathfinder.locateMonster("bscorpion")[0]

    return {
        configs: [
            {
                id: "bscorpion_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            disableZapper: true,
                            ensureEquipped: { ...MAGE_NORMAL },
                            targetingPartyMember: true,
                            type: "bscorpion"
                        }),
                        move: new ImprovedMoveStrategy("bscorpion")
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            type: "bscorpion"
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 100, sides: 16 })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableZapper: true,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            targetingPartyMember: true,
                            type: "bscorpion"
                        }),
                        move: new ImprovedMoveStrategy("bscorpion")
                    }
                ]
            }
        ]
    }
}