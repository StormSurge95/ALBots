import { Mage, Pathfinder, PingCompensatedCharacter, Warrior } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { HoldPositionMoveStrategy, MoveInCircleMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_NORMAL, MAGE_SPLASH, PRIEST_NORMAL, WARRIOR_NORMAL, WARRIOR_SPLASH } from "./equipment.js"

class MagePlantoidAttackStrategy extends MageAttackStrategy {
    protected async attack(bot: Mage): Promise<void> {
        const ents = bot.getEntities({ ...this.options })

        let highestLevel = 0
        for (const ent of ents) {
            if (ent.level > highestLevel) highestLevel = ent.level
        }

        if (highestLevel > 1) {
            this.options.ensureEquipped = { ...MAGE_NORMAL }
        } else {
            this.options.ensureEquipped = { ...MAGE_SPLASH }
        }

        return super.attack(bot)
    }
}

class WarriorPlantoidAttackStrategy extends WarriorAttackStrategy {
    protected async attack(bot: Warrior): Promise<void> {
        const ents = bot.getEntities({ ...this.options })

        let highestLevel = 0
        for (const ent of ents) {
            if (ent.level > highestLevel) highestLevel = ent.level
        }

        if (highestLevel > 1) {
            this.options.ensureEquipped = { ...WARRIOR_NORMAL }
            delete this.options.enableEquipForCleave
            delete this.options.enableGreedyAggro
            this.options.disableAgitate = true
            this.options.disableCleave = true
        } else {
            this.options.ensureEquipped = { ...WARRIOR_SPLASH }
            delete this.options.disableAgitate
            delete this.options.disableCleave
            this.options.enableEquipForCleave = true
            this.options.enableGreedyAggro = true
        }

        return super.attack(bot)
    }
}

export function constructPlantoidSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const spawn = Pathfinder.locateMonster("plantoid")[0]

    return {
        configs: [
            {
                id: "plantoid_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MagePlantoidAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            disableZapper: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            targetingPartyMember: true,
                            type: "plantoid"
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: 5 } })
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            ensureEquipped: { ...PRIEST_NORMAL },
                            targetingPartyMember: true,
                            type: "plantoid"
                        }),
                        move: new HoldPositionMoveStrategy(spawn, { offset: { x: -5 } })
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorPlantoidAttackStrategy({
                            contexts: contexts,
                            disableZapper: true,
                            enableEquipForCleave: true,
                            enableEquipForStomp: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            type: "plantoid"
                        }),
                        move: new MoveInCircleMoveStrategy({ center: spawn, radius: 20, sides: 8 })
                    }
                ]
            }
        ]
    }
}