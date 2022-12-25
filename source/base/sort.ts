import { Character, Entity, IPosition, MapName, MonsterName, Pathfinder, Tools } from "../../../ALClient/build/index.js"

/**
 * This function is meant to be used with `[].sort()`
 *
 * Example: `targets.sort(sortClosestDistance(bot))`
 *
 * @param to Compare the distance to this point
 * @returns A sorting function that will sort the objects closest to the position first
 */
export function sortClosestDistance(to: Character) {
    return (a: IPosition, b: IPosition) => {
        const d_a = Tools.squaredDistance(to, a)
        const d_b = Tools.squaredDistance(to, b)
        return d_a - d_b
    }
}

/**
 * This functions is meant to be used with `[].sort()`. This function will use the pathfinder's
 * logic to determine closest distance across maps, too.
 *
 * Example: `targets.sort(sortClosestDistancePathfinder(bot))`
 *
 * @param to Compare the distance to this point
 * @returns A sorting function that will sort the objects closest to the position first
 */
export function sortClosestDistancePathfinder(to: Character) {
    return (a: IPosition & { map: MapName }, b: IPosition & { map: MapName}) => {
        const path_a = Pathfinder.getPath(to, a)
        const path_b = Pathfinder.getPath(to, b)
        const d_a = Pathfinder.computePathCost(path_a)
        const d_b = Pathfinder.computePathCost(path_b)
        return d_a - d_b
    }
}

/**
 * This function is meant to be used with `[].sort()`
 *
 * Example: `targets.sort(sortTypeThenClosest(bot, ["osnake", "snake"]))`
 *
 * @param to Compare the distance to this point
 * @param types The list of monsters sorted by priority; most to least
 * @returns A sorting function that will sort the objects by type then by distance
 */
export function sortTypeThenClosest(to: Character, types: MonsterName[]) {
    return (a: Entity, b: Entity) => {
        const a_index = types.includes(a.type) ? types.indexOf(a.type) : Number.MAX_SAFE_INTEGER
        const b_index = types.includes(b.type) ? types.indexOf(b.type) : Number.MAX_SAFE_INTEGER
        if (a_index < b_index) return -1
        else if (a_index > b_index) return 1

        const d_a = Tools.squaredDistance(to, a)
        const d_b = Tools.squaredDistance(to, b)
        return d_a - d_b
    }
}

/**
 * This function is meant to be used with `[].sort()`
 *
 * Example: `targets.sort(sortFurthestDistance(bot))`
 *
 * @param from Compare the distance to this point
 * @returns A sorting algorithm that will sort the objects furthest from the position first
 */
export function sortFurthestDistance(from: Character) {
    return (a: IPosition, b: IPosition) => {
        const d_a = Tools.squaredDistance(from, a)
        const d_b = Tools.squaredDistance(from, b)
        return d_b - d_a
    }
}

export function sortPriority(bot: Character, types: MonsterName[]) {
    return (a: Entity, b: Entity): boolean => {
        // Order in array
        if (types?.length) {
            const a_index = types.indexOf(a.type)
            const b_index = types.indexOf(b.type)
            if (a_index < b_index) return true
            else if (a_index > b_index) return false
        }

        // Has a target -> higher priority
        if (a.target && !b.target) return true
        else if (!a.target && b.target) return false

        // Could die -> lower priority
        const a_couldDie = a.couldDieToProjectiles(bot, bot.projectiles, bot.players, bot.entities)
        const b_couldDie = b.couldDieToProjectiles(bot, bot.projectiles, bot.players, bot.entities)
        if (!a_couldDie && b_couldDie) return true
        else if (a_couldDie && !b_couldDie) return false

        // Will burn to death -> lower priority
        const a_willBurn = a.willBurnToDeath()
        const b_willBurn = b.willBurnToDeath()
        if (!a_willBurn && b_willBurn) return true
        else if (a_willBurn && !b_willBurn) return false

        // Higher level -> higher priority
        if (a.level > b.level) return true
        else if (a.level < b.level) return false

        // Lower HP -> higher priority
        if (a.hp < b.hp) return true
        else if (a.hp > b.hp) return false

        // Closer -> higher priority
        return Tools.squaredDistance(a, bot) < Tools.squaredDistance(b, bot)
    }
}