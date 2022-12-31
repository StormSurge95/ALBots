import { Pathfinder, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy, MoveInCircleMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

export function constructPRatSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const spawn = Pathfinder.locateMonster("prat")[0]

    return {
        configs: [
            {
                id: "prat_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            targetingPartyMember: true,
                            type: "prat"
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: -10 } })
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            targetingPartyMember: true,
                            type: "prat"
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: 10 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            enableGreedyAggro: true,
                            type: "prat"
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 20, sides: 8 })
                    }
                ]
            }
        ]
    }
}