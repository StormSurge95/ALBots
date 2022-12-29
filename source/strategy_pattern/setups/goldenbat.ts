import { PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { SpecialMonsterMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, PRIEST_NORMAL, WARRIOR_NORMAL } from "./equipment.js"

export function constructGoldenbatSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "goldenbat_mage",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...MAGE_NORMAL },
                            type: "goldenbat"
                        }),
                        move: new SpecialMonsterMoveStrategy({ type: "goldenbat" })
                    }
                ]
            },
            {
                id: "goldenbat_priest",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "goldenbat"
                        }),
                        move: new SpecialMonsterMoveStrategy({ type: "goldenbat" })
                    }
                ]
            },
            {
                id: "goldenbat_warrior",
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_NORMAL },
                            type: "goldenbat"
                        }),
                        move: new SpecialMonsterMoveStrategy({ type: "goldenbat" })
                    }
                ]
            }
        ]
    }
}