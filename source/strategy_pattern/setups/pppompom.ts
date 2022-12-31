import { IPosition, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_NORMAL, WARRIOR_NORMAL } from "./equipment.js"

export function constructPPPomPomSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const pos: IPosition = { map: "level2n", x: 120, y: -150 }

    return {
        configs: [
            {
                id: "pppompom_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_NORMAL },
                            maximumTargets: 1,
                            targetingPartyMember: true,
                            type: "pppompom"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { y: -20 } })
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            maximumTargets: 1,
                            type: "pppompom"
                        }),
                        move: new HoldPositionMoveStrategy(pos, { offset: { y: 20 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            maximumTargets: 1,
                            targetingPartyMember: true,
                            type: "pppompom"
                        }),
                        move: new HoldPositionMoveStrategy(pos)
                    }
                ]
            }
        ]
    }
}