import AL, { Character, Entity, Mage, MonsterName, Rogue } from "../../../ALClient/build/index.js"
import FastPriorityQueue from "fastpriorityqueue"
import { LOOP_MS } from "./general.js"
import { sortPriority } from "./sort.js"

export async function attackTheseTypesRogue(bot: Rogue, types: MonsterName[], friends: Character[] = [], options: {
    disableMentalBurst?: boolean
    disableQuickPunch?: boolean
    disableQuickStab?: boolean
    disableZapper?: boolean
    targetingPartyMember?: boolean
    targetingPlayer?: string
} = {}): Promise<void> {
    if (bot.c.town) return // Don't attack if teleporting

    // Adjust options
    if (options.targetingPlayer && options.targetingPlayer == bot.id) options.targetingPlayer = undefined

    const priority = sortPriority(bot, types)

    // Use mentalburst if we can kill it in one shot to get extra MP
    if (bot.canUse("mentalburst")) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const target of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: (bot.range * bot.G.skills.mentalburst.range_multiplier) + bot.G.skills.mentalburst.range_bonus
        })) {
            if (target.immune) continue // Entity won't take damage from mentalburst
            if (!bot.canKillInOneShot(target, "mentalburst")) continue
            targets.add(target)
        }

        const target = targets.peek()
        if (target) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.id == bot.id) continue // Don't delete it from our own list
                if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                friend.deleteEntity(target.id)
            }
            await bot.mentalBurst(target.id)
        }
    }

    // See if we can kill it using a combo to regen MP
    const canUseQuickPunch = bot.canUse("quickpunch")
    const canUseQuickStab = bot.canUse("quickstab")
    if (bot.canUse("mentalburst")
        && ((canUseQuickPunch && bot.mp >= bot.G.skills.mentalburst.mp + bot.G.skills.quickpunch.mp)
         || (canUseQuickStab && bot.mp >= bot.G.skills.mentalburst.mp + bot.G.skills.quickstab.mp))) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const target of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.range
        })) {
            if (target.immune) continue // Entity won't take damage from our combo

            // If it can heal, don't try to combo
            if (target.lifesteal) continue
            if (target.abilities?.self_healing) continue

            // If it can avoid our combo, don't try
            if (target.avoidance || target.reflection || target.evasion) continue

            if (!bot.canKillInOneShot(target, "mentalburst")) continue

            const mentalBurstMinDamage = this.calculateDamageRange(target, "mentalburst")[0]
            const quickPunchMinDamage = canUseQuickPunch ? this.calculateDamageRange(target, "quickpunch")[0] : 0
            const quickStabMinDamage = canUseQuickStab ? this.calculateDamageRange(target, "quickstab")[0] : 0

            if (target.hp < quickPunchMinDamage + quickStabMinDamage) continue // We'd kill it in one hit and not regain MP

            if (mentalBurstMinDamage + quickPunchMinDamage + quickStabMinDamage < target.hp) continue // We can't do enough damage to kill it with a combo

            targets.add(target)
        }

        const target = targets.peek()
        if (target) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.id == bot.id) continue // Don't delete it from our own list
                if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                friend.deleteEntity(target.id)
            }
            if (canUseQuickPunch) bot.quickPunch(target.id)
            if (canUseQuickStab) bot.quickStab(target.id)
            await bot.mentalBurst(target.id)
        }
    }

    if (bot.canUse("attack")) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const target of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.range
        })) {
            targets.add(target)
        }

        const target = targets.peek()
        if (!target) return // No target

        if (bot.canKillInOneShot(target)) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.id == bot.id) continue // Don't delete it from our own list
                if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                friend.deleteEntity(target.id)
            }
        }

        // Use our friends to energize for the attack speed boost
        if (!bot.s.energized) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.socket.disconnected) continue // Friend is disconnected
                if (friend.id == bot.id) continue // Can't energize ourselves
                if (AL.Tools.distance(bot, friend) > bot.G.skills.energize.range) continue // Too far away
                if (!friend.canUse("energize")) continue // Friend can't use energize

                // Energize!
                (friend as Mage).energize(bot.id, Math.min(100, Math.max(1, bot.max_mp - bot.mp))).catch(e => console.error(e))
                break
            }
        }

        await bot.basicAttack(target.id)
    }

    if (bot.canUse("mentalburst")) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const target of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: (bot.range * bot.G.skills.mentalburst.range_multiplier) + bot.G.skills.mentalburst.range_bonus
        })) {
            if (target.immune) continue // Entity won't take damage from mentalburst
            if (!bot.canKillInOneShot(target, "mentalburst")) continue
            targets.add(target)
        }

        const target = targets.peek()
        if (target) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.id == bot.id) continue // Don't delete it from our own list
                if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                friend.deleteEntity(target.id)
            }
            await bot.mentalBurst(target.id)
        }
    }

    if (!options.disableQuickPunch && bot.canUse("quickpunch")) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const entity of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.range
        })) {
            if (entity.immune) continue // Entity won't take damage from quickpunch
            targets.add(entity)
        }

        const target = targets.peek()
        if (target) {
            if (bot.canKillInOneShot(target, "quickpunch")) {
                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.id == bot.id) continue // Don't delete it from our own list
                    if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                    friend.deleteEntity(target.id)
                }
            }
            await bot.quickPunch(target.id)
        }
    }

    if (!options.disableQuickStab && bot.canUse("quickstab")) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const entity of bot.getEntities({
            canDamage: true,
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.range
        })) {
            if (entity.immune) continue // Entity won't take damage from quickstab
            targets.add(entity)
        }

        const target = targets.peek()
        if (target) {
            if (bot.canKillInOneShot(target, "quickstab")) {
                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.id == bot.id) continue // Don't delete it from our own list
                    if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                    friend.deleteEntity(target.id)
                }
            }
            await bot.quickStab(target.id)
        }
    }

    if (!options.disableZapper && bot.canUse("zapperzap", { ignoreEquipped: true }) && bot.cc < 100) {
        const targets = new FastPriorityQueue<Entity>(priority)
        for (const target of bot.getEntities({
            couldGiveCredit: true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.G.skills.zapperzap.range
        })) {
            if (!bot.G.skills.zapperzap.pierces_immunity && target.immune) continue
            // Zap if we can kill it in one shot, or we have a lot of mp
            if (bot.canKillInOneShot(target, "zapperzap") || bot.mp >= bot.max_mp - 500) targets.add(target)
        }

        if (targets.size) {
            const target = targets.peek()

            const zapper: number = bot.locateItem("zapper", bot.items, { returnHighestLevel: true })
            if (bot.isEquipped("zapper") || (zapper !== undefined)) {
                // Equip zapper
                if (zapper !== undefined) bot.equip(zapper, "ring1")

                // Zap
                const promises: Promise<unknown>[] = []
                promises.push(bot.zapperZap(target.id).catch(e => console.error(e)))

                // Re-equip ring
                if (zapper !== undefined) promises.push(bot.equip(zapper, "ring1"))
                await Promise.all(promises)
            }
        }
    }

    if (!options.disableZapper && bot.canUse("zapperzap", { ignoreEquipped: true }) && bot.cc < 100) {
        let strangerNearby = false
        for (const [, player] of bot.players) {
            if (player.isFriendly(bot)) continue // They are friendly

            const distance = AL.Tools.distance(bot, player)
            if (distance > bot.range + player.range + 100) continue // They are far away

            strangerNearby = true
            break
        }
        if (strangerNearby) {
            // Zap monsters to kill steal
            for (const target of bot.getEntities({
                canDamage: true,
                couldGiveCredit: true,
                willDieToProjectiles: true,
                withinRange: bot.range
            })) {
                if (target.immune) continue // Entity won't take damage from zap
                if (target.target) continue // Already has a target
                if (target.xp < 0) continue // Don't try to kill steal pets

                const zapper: number = bot.locateItem("zapper", bot.items, { returnHighestLevel: true })
                if (bot.isEquipped("zapper") || (zapper !== undefined)) {
                // Equip zapper
                    if (zapper !== undefined) bot.equip(zapper, "ring1")

                    // Zap
                    const promises: Promise<unknown>[] = []
                    promises.push(bot.zapperZap(target.id).catch(e => console.error(e)))

                    // Re-equip ring
                    if (zapper !== undefined) promises.push(bot.equip(zapper, "ring1"))
                    await Promise.all(promises)
                    break
                }
            }
        }
    }
}

export function startRSpeedLoop(bot: Rogue, options: {
    disableGiveToFriends?: boolean,
    enableGiveToStrangers?: boolean,
    giveToThesePlayers?: string[]
} = {}): void {
    async function rspeedLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.s.rspeed && bot.canUse("rspeed")) await bot.rspeed(bot.id)

            // Give rogue speed to friends
            if (!options.disableGiveToFriends && bot.canUse("rspeed")) {
                for (const [, player] of bot.players) {
                    if (player.isNPC()) continue
                    if (player.s.rspeed?.ms > 300_000) continue // Already has rogue speed
                    if (bot.party !== player.party && bot.owner !== player.owner) continue // Not a friend
                    if (AL.Tools.distance(bot, player) > bot.G.skills.rspeed.range) continue // Too far away

                    await bot.rspeed(player.id)
                    break
                }
            }

            // Give rogue speed to random players
            if (options.enableGiveToStrangers && bot.canUse("rspeed")) {
                for (const [, player] of bot.players) {
                    if (player.isNPC()) continue
                    if (player.s.rspeed?.ms > 300_000) continue // Already has rogue speed
                    if (AL.Tools.distance(bot, player) > bot.G.skills.rspeed.range) continue // Too far away

                    await bot.rspeed(player.id)
                    break
                }
            }

            // Give rogue speed to specific players
            if (options.giveToThesePlayers && bot.canUse("rspeed")) {
                for (const [, player] of bot.players) {
                    if (player.isNPC()) continue
                    if (!options.giveToThesePlayers.includes(player.id)) continue // Not in the list
                    if (player.s.rspeed?.ms > 300_000) continue // Already has rogue speed
                    if (AL.Tools.distance(bot, player) > bot.G.skills.rspeed.range) continue // Too far away

                    await bot.rspeed(player.id)
                    break
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("rspeedLoop", setTimeout(async () => { rspeedLoop() }, Math.max(LOOP_MS, bot.getCooldown("rspeed"))))
    }
    rspeedLoop()
}