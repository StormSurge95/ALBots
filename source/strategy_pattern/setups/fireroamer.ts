import { IPosition, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

export function constructFireRoamerSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const loc: IPosition = { map: "desertland", x: 180, y: -675 }
    return {
        configs: [
            {
                id: "fireroamer_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH }, // Need gstaff for splash
                            maximumTargets: 1,
                            targetingPartyMember: true,
                            type: "fireroamer"
                        }),
                        move: new HoldPositionMoveStrategy(loc, { offset: { x: -20 } })
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "fireroamer"
                        }),
                        move: new HoldPositionMoveStrategy(loc)
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            maximumTargets: 1,
                            targetingPartyMember: true,
                            type: "fireroamer"
                        }),
                        move: new HoldPositionMoveStrategy(loc, { offset: { x: 20 } })
                    }
                ]
            }
        ]
    }
}