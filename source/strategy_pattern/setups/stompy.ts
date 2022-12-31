import { PingCompensatedCharacter } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

export function constructStompySetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    return {
        configs: [
            {
                id: "stompy_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            targetingPartyMember: true,
                            type: "stompy"
                        }),
                        move: new ImprovedMoveStrategy("stompy")
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            type: "stompy",
                        }),
                        move: new ImprovedMoveStrategy("stompy")
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            targetingPartyMember: true,
                            typeList: ["stompy", "wolf"]
                        }),
                        move: new ImprovedMoveStrategy(["stompy", "wolf"])
                    }
                ]
            },
        ]
    }
}