import { MonsterName, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_LUCK, WARRIOR_NORMAL } from "./equipment.js"

export function constructGreenJrSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const monsters: MonsterName[] = ["greenjr", "osnake", "snake"]
    return {
        configs: [
            {
                id: "greenjr_priest,mage,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            typeList: monsters
                        }),
                        move: new ImprovedMoveStrategy("greenjr")
                    },
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...MAGE_NORMAL },
                            typeList: monsters
                        }),
                        move: new ImprovedMoveStrategy("greenjr", { offset: { x: -10 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            typeList: monsters
                        }),
                        move: new ImprovedMoveStrategy("greenjr", { offset: { x: 10 } })
                    }
                ]
            }
        ]
    }
}