import { IPosition, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

export function constructMummySetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const pos: IPosition = { map: "spookytown", x: 250, y: -1129 }

    return {
        configs: [
            {
                id: "mummy_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            type: "mummy"
                        }),
                        move: new HoldPositionMoveStrategy(pos)
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "mummy"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { x: 20 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            enableGreedyAggro: true,
                            type: "mummy"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { x: -20 } })
                    }
                ]
            },
            {
                id: "mummy_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "mummy"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { x: 10 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            enableGreedyAggro: true,
                            type: "mummy"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { x: -10 } })
                    }
                ]
            }
        ]
    }
}