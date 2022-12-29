import { Pathfinder, PingCompensatedCharacter, Priest } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy, MoveInCircleMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

class PriestGhostAttackStrategy extends PriestAttackStrategy {
    protected async attack(bot: Priest): Promise<void> {
        if (this.shouldAttack(bot)) {
            // Heal ghost to farm life essence
            if (bot.canUse("heal")) {
                entity:
                for (const ent of bot.getEntities({ type: "ghost", withinRange: bot.range })) {
                    if (ent.s.healed) continue
                    for (const projectile of bot.projectiles.values()) {
                        if (projectile.type !== "heal") continue // Not a healing projectile
                        if (projectile.target !== ent.id) continue
                        continue entity // There is a healing projectile already going towards this entity
                    }

                    await bot.healSkill(ent.id)
                }
            }
        }
        return super.attack(bot)
    }
}

export function constructGhostSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const spawn = Pathfinder.locateMonster("ghost")[0]

    return {
        configs: [
            {
                id: "ghost_priest,mage,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestGhostAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            enableGreedyAggro: true,
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 20, sides: 8 })
                    },
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: -5 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableZapper: true,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: 5 } })
                    }
                ]
            },
            {
                id: "ghost_priest,mage",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestGhostAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            enableGreedyAggro: true,
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 20, sides: 8 })
                    },
                    {
                        ctype: "mage",
                        attack: new MageAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new HoldPositionMoveStrategy(spawn)
                    }
                ]
            },
            {
                id: "ghost_priest,warrior",
                characters: [
                    {
                        ctype: "priest",
                        attack: new PriestGhostAttackStrategy({
                            contexts: contexts,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            enableGreedyAggro: true,
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 20, sides: 3 })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorAttackStrategy({
                            contexts: contexts,
                            disableZapper: true,
                            enableEquipForCleave: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: ["ghost", "tinyp"]
                        }),
                        move: new HoldPositionMoveStrategy(spawn)
                    }
                ]
            }
        ]
    }
}