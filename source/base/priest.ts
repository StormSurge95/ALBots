import AL, { Character, Entity, Mage, MonsterName, Player, Priest } from "alclient"
import FastPriorityQueue from "fastpriorityqueue"
import { LOOP_MS } from "./general.js"
import { sortPriority } from "./sort.js"

export async function attackTheseTypesPriest(bot: Priest, types: MonsterName[], friends: Character[] = [], options: {
    disableCreditCheck?: boolean
    disableGhostLifeEssenceFarm?: boolean
    disableZapper?: boolean
    healStrangers?: boolean
    targetingPartyMember?: boolean
    targetingPlayer?: string
} = {}): Promise<void> {
    if (bot.c.town) return // Don't attack if teleporting

    // Adjust options
    if (options.targetingPlayer && options.targetingPlayer == bot.id) options.targetingPlayer = undefined
    if (bot.map == "goobrawl") options.disableCreditCheck = true

    if (bot.canUse("heal")) {
        const healPriority = (a: Player, b: Player) => {
            // Heal our friends first
            const a_isFriend = friends.some((friend) => { friend?.id == a.id })
            const b_isFriend = friends.some((friend) => { friend?.id == b.id })
            if (a_isFriend && !b_isFriend) return true
            else if (b_isFriend && !a_isFriend) return false

            // Heal those with lower HP first
            const a_hpRatio = a.hp / a.max_hp
            const b_hpRatio = b.hp / b.max_hp
            if (a_hpRatio < b_hpRatio) return true
            else if (b_hpRatio < a_hpRatio) return false

            // Heal closer players
            return AL.Tools.distance(a, bot) < AL.Tools.distance(b, bot)
        }
        const players = new FastPriorityQueue<Character | Player>(healPriority)
        // Potentially heal ourself
        if (bot.hp / bot.max_hp <= 0.8) players.add(bot)
        // Potentially heal others
        for (const [, player] of bot.players) {
            if (AL.Tools.distance(bot, player) > bot.range) continue // Too far away to heal
            if (player.rip) continue // Player is already dead
            if (player.hp / player.max_hp > 0.8) continue // Player still has a lot of hp

            const isFriend = friends.some((friend) => { friend?.id == bot.id })
            if (!isFriend && bot.party && bot.party !== player.party && !options.healStrangers) continue // They're not our friend, not in our party, and we're not healing strangers

            players.add(player)
        }
        const toHeal = players.peek()
        if (toHeal) {
            await bot.heal(toHeal.id)
            return
        }
    }

    if (bot.isOnCooldown("scare")) return
    // Heal ghost to farm life essence
    if (!options.disableGhostLifeEssenceFarm && types?.includes("ghost") && bot.canUse("heal")) {
        for (const entity of bot.getEntities({ type: "ghost", withinRange: bot.range })) {
            if (entity.s.healed) continue

            await bot.heal(entity.id)
            return
        }
    }

    const attackPriority = sortPriority(bot, types)

    if (bot.canUse("attack")) {
        const targets = new FastPriorityQueue<Entity>(attackPriority)
        for (const target of bot.getEntities({
            canDamage: true,
            couldGiveCredit: options.disableCreditCheck ? undefined : true,
            targetingPartyMember: options.targetingPartyMember,
            targetingPlayer: options.targetingPlayer,
            typeList: types,
            willDieToProjectiles: false,
            withinRange: bot.range
        })) {
            targets.add(target)
        }
        if (targets.size == 0) return // No target

        const target = targets.peek()
        const canKill = bot.canKillInOneShot(target)

        // Apply curse if we can't kill it in one shot and we have enough MP
        if (bot.canUse("curse") && bot.mp > (bot.mp_cost + bot.G.skills.curse.mp) && !canKill && !target.immune) {
            bot.curse(target.id).catch(e => console.error(e))
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

        // Remove them from our friends' entities list if we're going to kill it
        if (canKill) {
            for (const friend of friends) {
                if (!friend) continue // No friend
                if (friend.id == bot.id) continue // Don't delete it from our own list
                if (AL.Constants.SPECIAL_MONSTERS.includes(target.type)) continue // Don't delete special monsters
                friend.deleteEntity(target.id)
            }
        }

        await bot.basicAttack(target.id).catch(() => { /* ignore error */ })
    }

    if (!options.disableZapper && bot.canUse("zapperzap", { ignoreEquipped: true }) && bot.cc < 100) {
        const targets = new FastPriorityQueue<Entity>(attackPriority)
        for (const target of bot.getEntities({
            couldGiveCredit: options.disableCreditCheck ? undefined : true,
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

export function startDarkBlessingLoop(bot: Priest): void {
    async function darkBlessingLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.s.darkblessing && bot.canUse("darkblessing")) await bot.darkBlessing()
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("darkBlessingLoop", setTimeout(async () => { darkBlessingLoop() }, Math.max(LOOP_MS, bot.getCooldown("darkblessing"))))
    }
    darkBlessingLoop()
}

export function startPartyHealLoop(bot: Priest, friends: Character[] = []): void {
    async function partyHealLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.c.town) {
                bot.timeouts.set("partyHealLoop", setTimeout(async () => { partyHealLoop() }, bot.c.town.ms))
                return
            }

            // Check provided characters (we can heal them wherever they are, we just need to know if they're hurt)
            if (bot.canUse("partyheal")) {
                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.party !== bot.party) continue // Our priest isn't in the same party!?
                    if (friend.rip) continue // Party member is already dead
                    if (friend.hp < friend.max_hp * 0.5) {
                        // Someone in our party has low HP
                        await bot.partyHeal()
                        break
                    }
                }
            }

            // Check characters around us
            if (bot.canUse("partyheal")) {
                for (const [, player] of bot.players) {
                    if (!player) continue // No player
                    if (player.party !== bot.party) continue // Not in the same party
                    if (player.rip) continue // Player is already dead
                    if (player.hp < player.max_hp * 0.5) {
                        // Someone in our party has low HP
                        await bot.partyHeal()
                        break
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("partyHealLoop", setTimeout(async () => { partyHealLoop() }, Math.max(bot.getCooldown("partyheal"), LOOP_MS)))
    }
    partyHealLoop()
}