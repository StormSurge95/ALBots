import { Constants, Game, Mage, Merchant, MonsterName, Paladin, Pathfinder, PingCompensatedCharacter, Priest, Ranger, Rogue, Warrior } from "../../../../ALClient/build/index.js"
import { Strategist, Strategy } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PaladinAttackStrategy } from "../strategies/attack_paladin.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { RangerAttackStrategy } from "../strategies/attack_ranger.js"
import { RogueAttackStrategy } from "../strategies/attack_rogue.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { MAGE_NORMAL, WARRIOR_NORMAL, WARRIOR_SPLASH, PRIEST_NORMAL, RANGER_NORMAL, PRIEST_LUCK } from "./equipment.js"

export type CharacterConfig = {
    ctype: "mage"
    attack: Strategy<Mage>
    move: Strategy<Mage>
} | {
    ctype: "merchant"
    attack: Strategy<Merchant>
    move: Strategy<Merchant>
} | {
    ctype: "paladin"
    attack: Strategy<Paladin>
    move: Strategy<Paladin>
} | {
    ctype: "priest"
    attack: Strategy<Priest>
    move: Strategy<Priest>
} | {
    ctype: "ranger"
    attack: Strategy<Ranger>
    move: Strategy<Ranger>
} | {
    ctype: "rogue"
    attack: Strategy<Rogue>
    move: Strategy<Rogue>
} | {
    ctype: "warrior"
    attack: Strategy<Warrior>
    move: Strategy<Warrior>
}

export type Config = {
    id: string
    characters: CharacterConfig[]
}

export type Setup = {
    configs: Config[]
}

export type Setups = { [T in MonsterName]?: Setup }

export function constructGenericSetups(contexts: Strategist<PingCompensatedCharacter>[], monsters: MonsterName[]): Setup {
    const id_prefix = monsters.join("+")
    const spawn = Pathfinder.locateMonster(monsters[0])[0]

    let allMagical = true
    let allPhysical = true
    for (const monster of monsters) {
        if (Constants.ONE_SPAWN_MONSTERS.includes(monster)) continue // There will only be one of this monster; that's okay
        const gInfo = Game.G.monsters[monster]
        if (gInfo.damage_type == "pure") {
            allMagical = undefined
            allPhysical = undefined
            break
        } else if (gInfo.damage_type == "physical") {
            allMagical = undefined
        } else if (gInfo.damage_type == "magical") {
            allPhysical = undefined
        }
    }

    return {
        configs: [
            {
                id: `${id_prefix}_mage`,
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...MAGE_NORMAL },
                            typeList: monsters
                        }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            },
            {
                id: `${id_prefix}_paladin`,
                characters: [
                    {
                        ctype: "paladin",
                        attack: new PaladinAttackStrategy({ contexts: contexts, typeList: monsters }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            },
            {
                id: `${id_prefix}_priest`,
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            enableGreedyAggro: allMagical ? true : undefined,
                            ensureEquipped: allMagical ? PRIEST_LUCK : PRIEST_NORMAL
                        }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            },
            {
                id: `${id_prefix}_ranger`,
                characters: [
                    {
                        ctype: "ranger",
                        attack: new RangerAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            ensureEquipped: { ...RANGER_NORMAL }
                        }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            },
            {
                id: `${id_prefix}_rogue`,
                characters: [
                    {
                        ctype: "rogue",
                        attack: new RogueAttackStrategy({ contexts: contexts, typeList: monsters }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            },
            {
                id: `${id_prefix}_warrior`,
                characters: [
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            typeList: monsters,
                            enableEquipForCleave: true,
                            enableGreedyAggro: allPhysical ? true : undefined,
                            ensureEquipped: allPhysical ? { ...WARRIOR_SPLASH } : { ...WARRIOR_NORMAL }
                        }),
                        move: new ImprovedMoveStrategy(monsters, { idlePosition: spawn })
                    }
                ]
            }
        ]
    }
}