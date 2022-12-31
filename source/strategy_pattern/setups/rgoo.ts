import { Mage, MonsterName, PingCompensatedCharacter, Warrior } from "../../../../ALClient/build/index.js"
import { Strategist } from "../context.js"
import { MageAttackStrategy } from "../strategies/attack_mage.js"
import { PriestAttackStrategy } from "../strategies/attack_priest.js"
import { WarriorAttackStrategy } from "../strategies/attack_warrior.js"
import { ImprovedMoveStrategy } from "../strategies/move.js"
import { Setup } from "./base.js"
import { MAGE_SPLASH, MAGE_NORMAL, PRIEST_LUCK, WARRIOR_SPLASH, WARRIOR_NORMAL } from "./equipment.js"

class MageRGooAttackStrategy extends MageAttackStrategy {
    public onApply(bot: Mage): void {
        super.onApply(bot)
        if (bot.isPVP()) {
            // No splash damage
            this.options.ensureEquipped = { ...MAGE_NORMAL }
            delete this.options.enableGreedyAggro
        } else {
            // splash damage & additional monsters
            this.options.ensureEquipped = { ...MAGE_SPLASH }
            this.options.enableGreedyAggro = true
        }
    }
}

class WarriorRGooAttackStrategy extends WarriorAttackStrategy {
    public onApply(bot: Warrior): void {
        super.onApply(bot)
        if (bot.isPVP()) {
            // No splash damage
            this.options.disableCleave = true
            this.options.ensureEquipped = { ...WARRIOR_NORMAL }
            delete this.options.enableEquipForCleave
            delete this.options.enableGreedyAggro
        } else {
            // Splash damage & additional monsters
            delete this.options.disableCleave
            this.options.ensureEquipped = { ...WARRIOR_SPLASH }
            this.options.enableEquipForCleave = true
            this.options.enableGreedyAggro = true
        }
    }
}

export function constructRGooSetup(contexts: Strategist<PingCompensatedCharacter>[]): Setup {
    const goos: MonsterName[] = ["rgoo", "bgoo"]
    const moveStrat = new ImprovedMoveStrategy(goos, { idlePosition: { map: "goobrawl", x: 0, y: 0 } })

    return {
        configs: [
            {
                id: "rgoo_mage,priest,warrior",
                characters: [
                    {
                        ctype: "mage",
                        attack: new MageRGooAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...MAGE_SPLASH },
                            typeList: goos
                        }),
                        move: moveStrat
                    },
                    {
                        ctype: "priest",
                        attack: new PriestAttackStrategy({
                            contexts: contexts,
                            disableEnergize: true,
                            enableGreedyAggro: true,
                            enableHealStrangers: true,
                            ensureEquipped: { ...PRIEST_LUCK },
                            typeList: goos
                        }),
                        move: moveStrat
                    },
                    {
                        ctype: "warrior",
                        attack: new WarriorRGooAttackStrategy({
                            contexts: contexts,
                            enableEquipForCleave: true,
                            enableGreedyAggro: true,
                            ensureEquipped: { ...WARRIOR_SPLASH },
                            typeList: goos
                        }),
                        move: moveStrat
                    }
                ]
            }
        ]
    }
}