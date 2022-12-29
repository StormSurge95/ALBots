import { IPosition, PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { HoldPositionMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { PRIEST_NORMAL, PRIEST_LUCK, MAGE_NORMAL } from "./equipment.js"

export function constructBooBooSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const location: IPosition = { map: "spookytown", x: 265, y: -625 }
    return {
        configs: [
            {
                id: "booboo_mage,priest",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_NORMAL },
                            type: "booboo"
                        }),
                        move: new HoldPositionMoveStrategy(location, { offset: { y: -20 } })
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            type: "booboo"
                        }),
                        move: new HoldPositionMoveStrategy(location, { offset: { y: 20 } })
                    }
                ]
            },
            {
                id: "booboo_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "booboo"
                        }),
                        move: new HoldPositionMoveStrategy(location, { offset: { y: 20 } })
                    }
                ]
            }
        ]
    }
}