import { ItemName, Character, TradeSlotType, Constants, Game } from "../../../../ALClient/build/index.js"
import { Loop, LoopName, Strategy } from "../context.js"

export type SellStrategyOptions = {
    /**
     * Sell these items if they meet the following criteria
     *
     * ItemName -> [Level, Price]
     * IMPORTANT: Only set `Price` to `undefined` if `Level` is 0. We don't have a way to check the value of higher level items yet (TODO).
     */
    sellMap?: Map<ItemName, [number, number][]>
}

export const RecommendedSellStrategyOptions: SellStrategyOptions = {
    sellMap: new Map([
        // TODO: Add more things to sell
        ["bow", [[0, undefined]]]
    ])
}

export class SellStrategy<Type extends Character> implements Strategy<Type> {
    public loops = new Map<LoopName, Loop<Type>>()

    public sellMap: Map<ItemName, [number, number][]>

    public constructor(options: SellStrategyOptions = RecommendedSellStrategyOptions) {
        if (options.sellMap) this.sellMap = { ...options.sellMap }

        for (const [itemName, criteria] of this.sellMap) {
            const gData = Game.G.items[itemName]
            const npcPrice = gData.g * Constants.NPC_SELL_TAX
            if (criteria == undefined) {
                // Sell it for the NPC price
                if (gData.upgrade || gData.compound) {
                    this.sellMap.set(itemName, [[0, npcPrice]])
                } else {
                    this.sellMap.set(itemName, [[undefined, npcPrice]])
                }
                continue
            }
            for (const criterion of criteria) {
                const level = criterion[0]
                const sellFor = criterion[1]

                // If price is defined, make sure it's higher than what we could sell it to an NPC for
                if (sellFor !== undefined) {
                    if (sellFor < npcPrice) {
                        console.warn(`Raising sell price for ${itemName}${level ?? ` (level ${level})`} from ${sellFor} to ${npcPrice} to match the price NPCs will pay.`)
                        criterion[1] = npcPrice
                    }
                }

                if (sellFor === undefined) {
                    // TODO: Make a function that checks the item value
                    if (level > 0) {
                        console.warn(`Sell price for ${itemName} (level ${level}) is not set. Selling to NPCs only.`)
                    }
                }
            }
        }

        this.loops.set("sell", {
            fn: async (bot: Type) => { await this.sell(bot) },
            interval: 1000
        })
    }

    private async sell(bot: Type) {
        if (this.sellMap) {
            await this.sellToMerchants(bot)
            await this.sellToNPCs(bot)
        }
    }

    private async sellToMerchants(bot: Type) {
        const players = bot.getPlayers({
            withinRange: Constants.NPC_INTERACTION_DISTANCE
        })
        for (const player of players) {
            for (const s in player.slots) {
                const slot = s as TradeSlotType
                const item = player.slots[slot]

                if (!item) continue // No item
                if (!item.rid) continue // Not a trade item
                if (!item.b) continue // selling; not buying

                const criteria = this.sellMap.get(item.name)
                if (!criteria) continue // Not selling this item
                if (!criteria.some(a => {
                    const level = a[0]
                    const sellFor = Math.max(a[1] ?? 0, (bot.G.items[item.name].g * bot.G.multipliers.buy_to_sell * (1 + bot.tax)))

                    return level == item.level && item.price >= sellFor
                })) continue // we don't have the level or they aren't paying enough

                const index = bot.locateItem(item.name, bot.items, { level: item.level, locked: false })
                if (index === undefined) continue // We don't have this item
                await bot.sellToMerchant(player.id, slot, item.rid, Math.min(bot.items[index].q ?? 1, item.q ?? 1)).catch(bot.error)
            }
        }
    }

    private async sellToNPCs(bot: Type) {
        if (!bot.canSell()) return

        for (let i = 0; i < bot.items.length; i++) {
            const item = bot.items[i]
            if (!item) continue // no item
            if (item.l) continue // item locked

            const criteria = this.sellMap.get(item.name)
            if (!criteria) continue // not selling this item
            if (!criteria.some(a => {
                const level = a[0]
                if (level != item.level) return false // not the same level

                const sellFor = a[1]
                if (sellFor !== undefined && sellFor > bot.G.items[item.name].g * Constants.NPC_SELL_TAX) return false // we don't want to sell this to an npc

                return true
            })) continue // aren't selling this item

            await bot.sell(i, item.q ?? 1).catch(bot.error)
        }
    }
}