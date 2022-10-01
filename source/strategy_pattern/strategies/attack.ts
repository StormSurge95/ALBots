import { Character, Constants, EntitiesData, Entity, GetEntitiesFilters, ItemName, LocateItemFilters, Mage, PingCompensatedCharacter, SkillName, SlotType, Tools } from "../../../../ALClient/"
import FastPriorityQueue from "fastpriorityqueue"
import { sortPriority } from "../../base/sort.js"
import { Loop, LoopName, Strategist, Strategy } from "../context.js"

export type BaseAttackStrategyOptions = GetEntitiesFilters & {
    contexts: Strategist<PingCompensatedCharacter>[]
    disableCreditCheck?: true
    disableEnergize?: true
    disableZapper?: true
    /** If set, we will aggro as many nearby monsters as we can */
    enableGreedyAggro?: true
    /** If set, we will check if we have the correct items equipped before and after attacking */
    ensureEquipped?: {
        [T in SlotType]?: {
            name: ItemName
            filters?: LocateItemFilters
        }
    }
    maximumTargets?: number
}

export class BaseAttackStrategy<Type extends Character> implements Strategy<Type> {
    public loops = new Map<LoopName, Loop<Type>>()

    protected greedyOnEntities: (data: EntitiesData) => Promise<void>

    protected options: BaseAttackStrategyOptions
    protected interval: SkillName[] = ["attack"]

    public constructor(options?: BaseAttackStrategyOptions) {
        this.options = options ?? {
            contexts: []
        }
        if (!this.options.disableCreditCheck && this.options.couldGiveCredit === undefined) this.options.couldGiveCredit = true
        if (this.options.willDieToProjectiles === undefined) this.options.willDieToProjectiles = false

        if (!options.disableZapper) this.interval.push("zapperzap")

        this.loops.set("attack", {
            fn: async (bot: Type) => {
                if (!this.shouldAttack(bot)) return
                await this.attack(bot)
            },
            interval: this.interval
        })
    }

    public onApply(bot: Type) {
        if (this.options.enableGreedyAggro && !this.options.disableZapper) {
            this.greedyOnEntities = async (data: EntitiesData) => {
                if (data.monsters.length == 0) return // No monsters
                if (!bot.canUse("zapperzap")) return // Can't zap
                for (const monster of data.monsters) {
                    if (monster.target) continue // Already has a target
                    if (this.options.type && monster.type !== this.options.type) continue
                    if (this.options.typeList && !this.options.typeList.includes(monster.type)) continue
                    if (Tools.distance(bot, monster) > bot.G.skills.zapperzap.range) continue
                    await bot.zapperZap(monster.id).catch(console.error)
                }
            }
            bot.socket.on("entities", this.greedyOnEntities)
        }
    }

    protected async attack(bot: Type) {
        const priority = sortPriority(bot, this.options.typeList)

        await this.ensureEquipped(bot)

        await this.basicAttack(bot, priority)
        if (!this.options.disableZapper) await this.zapperAttack(bot, priority)

        await this.ensureEquipped(bot)
    }

    protected async basicAttack(bot: Type, priority: (a: Entity, b: Entity) => boolean): Promise<unknown> {
        if (!bot.canUse("attack")) return // We can't attack

        if (this.options.enableGreedyAggro) {
            const entities = bot.getEntities({
                canDamage: "attack",
                hasTarget: false,
                type: this.options.type,
                typeList: this.options.typeList,
                withinRange: "attack"
            })
            if (
                entities.length
                && !(this.options.maximumTargets && bot.targets >= this.options.maximumTargets)) {
                // Prioritize the entities
                const targets = new FastPriorityQueue<Entity>(priority)
                for (const entity of entities) targets.add(entity)

                return bot.basicAttack(targets.peek().id).catch(console.error)
            }
        }

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
            return bot.basicAttack(target.id).catch(console.error)
        }
    }

    protected async ensureEquipped(bot: Type) {
        if (!this.options.ensureEquipped) return
        for (const sT in this.options.ensureEquipped) {
            const slotType = sT as SlotType
            const ensure = this.options.ensureEquipped[slotType]
            if (!bot.slots[slotType] || bot.slots[slotType].name !== ensure.name) {
                const toEquip = bot.locateItem(ensure.name, bot.items, ensure.filters)
                if (toEquip == undefined) throw new Error(`Couldn't find ${ensure.name} to equip in ${sT}.`)
                await bot.equip(toEquip, slotType)
            }
        }
    }

    protected async zapperAttack(bot: Type, priority: (a: Entity, b: Entity) => boolean) {
        if (!bot.canUse("zapperzap")) return // We can't zap

        if (this.options.enableGreedyAggro) {
            const entities = bot.getEntities({
                canDamage: "zapperzap",
                hasTarget: false,
                type: this.options.type,
                typeList: this.options.typeList,
                withinRange: "zapperzap"
            })
            if (
                entities.length
                && !(this.options.maximumTargets && bot.targets >= this.options.maximumTargets)) {
                // Prioritize the entities
                const targets = new FastPriorityQueue<Entity>(priority)
                for (const entity of entities) targets.add(entity)

                return bot.zapperZap(targets.peek().id).catch(console.error)
            }
        }

        // Find all targets we want to attack
        const entities = bot.getEntities({
            ...this.options,
            canDamage: "zapperzap",
            withinRange: "zapperzap"
        })
        if (bot.mp < bot.max_mp - 500) {
            // When we're not near full mp, only zap if we can kill the entity in one shot
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i]
                if (!bot.canKillInOneShot(entity, "zapperzap")) {
                    entities.splice(i, 1)
                    i--
                    continue
                }
            }
        }
        if (entities.length == 0) return // No targets to attack

        // Prioritize the entities
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const entity of entities) {
            // If we can kill something guaranteed, break early
            if (bot.canKillInOneShot(entity, "zapperzap")) {
                this.preventOverkill(bot, entity)
                return bot.zapperZap(entity.id).catch(console.error)
            }

            targets.add(entity)
        }

        const targetingMe = bot.calculateTargets()

        while (targets.size) {
            const entity = targets.poll()

            if (!entity.target) {
                // We're going to be tanking this monster, don't attack if it pushes us over our limit
                if (this.options.maximumTargets && bot.targets >= this.options.maximumTargets) continue // We don't want another target
                switch (entity.damage_type) {
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

            return bot.zapperZap(entity.id).catch(console.error)
        }
    }

    /**
     * If we have `options.contexts` set, we look for a mage that can energize us.
     *
     * @param bot The bot to energize
     */
    protected getEnergizeFromOther(bot: Character) {
        if (!bot.s.energized && !this.options.disableEnergize) {
            for (const context of this.options.contexts) {
                const friend = context.bot
                if (!friend) continue // Friend is missing
                if (friend.socket.disconnected) continue // Friend is disconnected
                if (friend == bot) continue // Can't energize ourselves
                if (Tools.distance(bot, friend) > bot.G.skills.energize.range) continue // Too far away
                if (!friend.canUse("energize")) continue // Friend can't use energize

                // Energize!
                (friend as Mage).energize(bot.id, Math.min(100, Math.max(1, bot.max_mp - bot.mp))).catch(console.error)
                return
            }
        }
    }

    /**
     * Call this function if we are going to kill the target
     *
     * If we have `options.contexts` set, calling this will remove the target from the other
     * characters so they won't attack it.
     *
     * @param bot The bot that is performing the attack
     * @param target The target we will kill
     */
    protected preventOverkill(bot: Character, target: Entity) {
        for (const context of this.options.contexts) {
            const friend = context.bot
            if (!friend) continue
            if (friend == bot) continue // Don't remove it from ourself
            if (Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
            friend.deleteEntity(target.id)
        }
    }

    /**
     * Check if we should attack with the bot, or if there's a reason we shouldn't.
     *
     * @param bot The bot that is attacking
     */
    protected shouldAttack(bot: Character) {
        if (bot.c.town) return false // Don't attack if teleporting
        if (bot.c.fishing || bot.c.mining) return false // Don't attack if mining or fishing
        if (bot.isOnCooldown("scare")) return false // Don't attack if scare is on cooldown
        return true
    }
}