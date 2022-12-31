
import { PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { SpecialMonsterMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_NORMAL, WARRIOR_NORMAL } from "./equipment.js"

export function constructRHarpySetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const moveStrategy = new SpecialMonsterMoveStrategy({ type: "rharpy" })
    return {
        configs: [
            {
                id: "rharpy_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ... MAGE_NORMAL },
                            type: "rharpy",
                        }),
                        move: moveStrategy
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "rharpy",
                        }),
                        move: moveStrategy
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            type: "rharpy",
                        }),
                        move: moveStrategy
                    }
                ]
            },
        ]
    }
}