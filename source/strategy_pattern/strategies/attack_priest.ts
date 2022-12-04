import { Entity, PingCompensatedCharacter, Player, Priest, Tools } from "../../../../ALClient/build/index.js"
import FastPriorityQueue from "fastpriorityqueue"
import { sortPriority } from "../../base/sort.js"
import { BaseAttackStrategy, BaseAttackStrategyOptions } from "./attack.js"

export type PriestAttackStrategyOptions = BaseAttackStrategyOptions & {
    disableAbsorb?: true
    disableCurse?: true
    disableDarkBlessing?: true
    enableHealStrangers?: true
}

export class PriestAttackStrategy extends BaseAttackStrategy<Priest> {
    public options: PriestAttackStrategyOptions
    
    public constructor(options?: PriestAttackStrategyOptions) {
        super(options)

        if (!this.options.disableDarkBlessing) this.interval.push("darkblessing")
    }

    protected async attack(bot: Priest): Promise<void> {
        await this.healFriendsOrSelf(bot)
        if (!this.options.disableDarkBlessing) this.applyDarkBlessing(bot)

        if (!this.shouldAttack(bot)) return

        const priority = sortPriority(bot, this.options.typeList)

        await this.ensureEquipped(bot)

        if (!this.options.disableBasicAttack) await this.basicAttack(bot, priority)
        if (!this.options.disableAbsorb) await this.absorbTargets(bot)
        if (!this.options.disableZapper) await this.zapperAttack(bot, priority)

        await this.ensureEquipped(bot)
    }

    protected async basicAttack(bot: Priest, priority: (a: Entity, b: Entity) => boolean): Promise<unknown> {
        if (!bot.canUse("attack")) return // We can't attack

        // Find all targets we want to attack
        const entities = bot.getEntities({
            ...this.options,
            canDamage: "attack",
            withinRange: "attack"
        })
        if (entities.length == 0) return // No targets to attack

        // Prioritize the entities
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const entity of entities) targets.add(entity)

        const targetingMe = bot.calculateTargets()

        if (!this.options.disableCurse) this.applyCurse(bot, targets.peek())

        while (targets.size) {
            const target = targets.poll()

            if (!target.target) {
                // We're going to be tanking this monster, don't attack if it pushes us over our limit
                if (bot.targets >= this.options.maximumTargets) continue // We don't want another target
                switch (target.damage_type) {
                    case "magical":
                        if (bot.mcourage <= targetingMe.magical) continue // We can't tank any more magical monsters
                        break
                    case "physical":
                        if (bot.courage <= targetingMe.physical) continue // We can't tank any more physical monsters
                        break
                    case "pure":
                        if (bot.pcourage <= targetingMe.pure) continue // We can't tank any more pure monsters
                        break
                }
            }

            const canKill = bot.canKillInOneShot(target)
            if (canKill) this.preventOverkill(bot, target)
            if (!canKill || targets.size > 0) this.getEnergizeFromOther(bot)
            return bot.basicAttack(target.id).catch(bot.error)
        }
    }

    protected async healFriendsOrSelf(bot: Priest): Promise<unknown> {
        if (!bot.canUse("heal")) return

        const healPriority = (a: PingCompensatedCharacter, b: PingCompensatedCharacter) => {
            // heal our friends first
            const a_isFriend = this.options.contexts.some(friend => friend.bot?.id == a.id)
            const b_isFriend = this.options.contexts.some(friend => friend.bot?.id == b.id)
            if (a_isFriend && !b_isFriend) return true
            else if (b_isFriend && !a_isFriend) return false

            // Heal those with lower HP first
            const a_hpRatio = a.hp / a.max_hp
            const b_hpRatio = b.hp / b.max_hp
            if (a_hpRatio < b_hpRatio) return true
            if (b_hpRatio < a_hpRatio) return false

            // Heal closer players
            return Tools.distance(a, bot) < Tools.distance(b, bot)
        }

        const players = new FastPriorityQueue<PingCompensatedCharacter | Player>(healPriority)

        // Potentially heal ourself
        if (bot.hp / bot.max_hp <= 0.8) players.add(bot)

        for (const player of bot.getPlayers({
            isDead: false,
            isFriendly: this.options.enableHealStrangers ? undefined : true,
            isNPC: false,
            withinRange: "heal"
        })) {
            if (player.hp / player.max_hp > 0.8) continue // They have enough hp

            // TODO: Check for healing projectiles, if they'll be fully healed from them, don't heal

            players.add(player)
        }

        const toHeal = players.peek()
        if (toHeal) {
            return bot.healSkill(toHeal.id).catch(bot.error)
        }
    }

    protected async absorbTargets(bot: Priest) {
        if (!bot.canUse("absorb")) return // Can't absorb

        if (this.options.enableGreedyAggro) {
            // Absorb the sins of other players attacking coop monsters
            const entity = bot.getEntity({
                couldGiveCredit: true,
                targetingPartyMember: false,
                type: this.options.type,
                typeList: this.options.typeList
            })
            if (entity) {
                const player = bot.players.get(entity.target)
                if (player && Tools.distance(bot, player) < bot.G.skills.absorb.range) {
                    return bot.absorbSins(player.id).catch(bot.error)
                }
            }
        }
    }

    protected applyCurse(bot: Priest, entity: Entity) {
        if (!entity) return // No entity
        if (entity.immune && !bot.G.skills.curse.pierces_immunity) return // Can't curse
        if (!bot.canUse("curse")) return
        if (bot.canKillInOneShot(entity) || entity.willBurnToDeath() || entity.willDieToProjectiles(bot, bot.projectiles, bot.players, bot.entities)) return

        bot.curse(entity.id).catch(bot.error)
    }

    protected async applyDarkBlessing(bot: Priest) {
        if (!bot.canUse("darkblessing")) return
        if (bot.s.darkblessing) return
        if (!bot.getEntity(this.options)) return

        return bot.darkBlessing().catch(bot.error)
    }
}