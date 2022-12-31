import { BankPackName, Character, Constants, IPosition, ItemName, LocateItemsFilters, Merchant, Pathfinder, PingCompensatedCharacter, PlayerModel, SlotType, Tools, TradeSlotType } from "../../../ALClient/build/index.js"
import { getItemCountsForEverything, getItemsToCompoundOrUpgrade, getOfferingToUse, IndexesToCompoundOrUpgrade, ItemCount, withdrawItemFromBank } from "../base/banking.js"
import { checkOnlyEveryMS, sleep, sortBank, sortInventory } from "../base/general.js"
import { bankingPosition, mainFishingSpot, miningSpot } from "../base/locations.js"
import { MERCHANT_ITEMS_TO_HOLD } from "../base/merchant.js"
import { Loop, LoopName, Strategist, Strategy } from "../strategy_pattern/context.js"
import { BaseAttackStrategy } from "../strategy_pattern/strategies/attack.js"
import { BuyStrategy } from "../strategy_pattern/strategies/buy.js"
import { AcceptPartyRequestStrategy } from "../strategy_pattern/strategies/party.js"
import { ToggleStandStrategy } from "../strategy_pattern/strategies/stand.js"
import { TrackerStrategy } from "../strategy_pattern/strategies/tracker.js"

export const DEFAULT_EXCHANGEABLES = new Set<ItemName>([
    "armorbox",
    "gem0",
    "gem1",
    "leather",
    "seashell",
    "weaponbox"
])
export const DEFAULT_GOLD_TO_HOLD = 100_000_000
export const DEFAULT_ITEMS_TO_HOLD = new Set<ItemName>([
    "computer",
    "goldbooster",
    "hpot1",
    "luckbooster",
    "mpot1",
    "supercomputer",
    "tracker",
    "xpbooster",
    "xptome"
])
export const DEFAULT_MERCHANT_ITEMS_TO_HOLD = new Set<ItemName>([
    ...DEFAULT_ITEMS_TO_HOLD,
    "cscroll0",
    "cscroll1",
    "cscroll2",
    "offering",
    "offeringp",
    "pickaxe",
    "rod",
    "scroll0",
    "scroll1",
    "scroll2"
])
export const DEFAULT_REPLENISHABLES = new Map<ItemName, number>([
    ["elixirluck", 1],
    ["hpot1", 2500],
    ["mpot1", 2500],
    ["xptome", 1]
])
export const DEFAULT_MERCHANT_REPLENISHABLES = new Map<ItemName, number>([
    ["cscroll0", 500],
    ["cscroll1", 50],
    ["cscroll2", 5],
    ["scroll0", 500],
    ["scroll1", 50],
    ["scroll2", 5]
])
export const DEFAULT_REPLENISH_RATIO = 0.5

/**
 * Prices set < 0 will be set to `G.items[itemName].g * (-price)`
 * For example, if an item's price is set to `-0.9` we will pay up to `G.items[itemName].g * 0.9` for it.
 */
export const DEFAULT_ITEMS_TO_BUY = new Map<ItemName, number>([
    ["5bucks", 100_000_000],
    ["amuletofm", -Constants.PONTY_MARKUP],
    ["basher", -Constants.PONTY_MARKUP],
    ["bataxe", -Constants.PONTY_MARKUP],
    ["bcape", -Constants.PONTY_MARKUP],
    ["bottleofxp", -Constants.PONTY_MARKUP],
    ["computer", 100_000_000],
    ["crossbow", -Constants.PONTY_MARKUP],
    ["cryptkey", 1_000_000],
    ["cscroll3", -Constants.PONTY_MARKUP],
    ["cxjar", 1_000_000],
    ["cyber", -Constants.PONTY_MARKUP],
    ["dartgun", -Constants.PONTY_MARKUP],
    ["dexearringx", -Constants.PONTY_MARKUP],
    ["dkey", 100_000_000],
    ["dragondagger", -Constants.PONTY_MARKUP],
    ["emotionjar", 1_000_000],
    ["essenceoffire", -Constants.PONTY_MARKUP],
    ["essenceoffrost", -Constants.PONTY_MARKUP],
    ["essenceofgreed", 25_000_000],
    ["essenceofnature", -Constants.PONTY_MARKUP],
    ["exoarm", -Constants.PONTY_MARKUP],
    ["fallen", -Constants.PONTY_MARKUP],
    ["fierygloves", -Constants.PONTY_MARKUP],
    ["firebow", -Constants.PONTY_MARKUP],
    ["firestars", -Constants.PONTY_MARKUP],
    ["frostbow", -Constants.PONTY_MARKUP],
    ["froststaff", -Constants.PONTY_MARKUP],
    ["fury", -Constants.PONTY_MARKUP],
    ["gbow", -Constants.PONTY_MARKUP],
    ["glolipop", -Constants.PONTY_MARKUP],
    ["goldenpowerglove", -Constants.PONTY_MARKUP],
    ["goldingot", -Constants.PONTY_MARKUP],
    ["goldnugget", -Constants.PONTY_MARKUP],
    ["gstaff", -Constants.PONTY_MARKUP],
    ["harbringer", -Constants.PONTY_MARKUP],
    ["harpybow", -Constants.PONTY_MARKUP],
    ["hboots", -Constants.PONTY_MARKUP],
    ["hdagger", -Constants.PONTY_MARKUP],
    ["lmace", -Constants.PONTY_MARKUP],
    ["luckyt", -Constants.PONTY_MARKUP],
    ["mearring", -Constants.PONTY_MARKUP],
    ["mpxamulet", -Constants.PONTY_MARKUP],
    ["mpxbelt", -Constants.PONTY_MARKUP],
    ["mpxgloves", -Constants.PONTY_MARKUP],
    ["mshield", -Constants.PONTY_MARKUP],
    ["networkcard", -Constants.PONTY_MARKUP],
    ["northstar", -Constants.PONTY_MARKUP],
    ["offering", -0.95],
    ["offeringp", -Constants.PONTY_MARKUP],
    ["ololipop", -Constants.PONTY_MARKUP],
    ["oxhelmet", -Constants.PONTY_MARKUP],
    ["pinkie", -Constants.PONTY_MARKUP],
    ["platinumingot", -Constants.PONTY_MARKUP],
    ["platinumnugget", -Constants.PONTY_MARKUP],
    ["powerglove", -Constants.PONTY_MARKUP],
    ["rabbitsfoot", -Constants.PONTY_MARKUP],
    ["sanguine", -Constants.PONTY_MARKUP],
    ["sbelt", -Constants.PONTY_MARKUP],
    ["scroll3", -Constants.PONTY_MARKUP],
    ["scroll4", -Constants.PONTY_MARKUP],
    ["scythe", -Constants.PONTY_MARKUP],
    ["snakeoil", -Constants.PONTY_MARKUP],
    ["snowflakes", -Constants.PONTY_MARKUP],
    ["snring", -Constants.PONTY_MARKUP],
    ["starkillers", -Constants.PONTY_MARKUP],
    ["stealthcape", -Constants.PONTY_MARKUP],
    ["supercomputer", 100_000_000],
    ["supermittens", -Constants.PONTY_MARKUP],
    ["t2quiver", -Constants.PONTY_MARKUP],
    ["t3bow", -Constants.PONTY_MARKUP],
    ["tshirt3", -Constants.PONTY_MARKUP],
    ["tshirt6", -Constants.PONTY_MARKUP],
    ["tshirt7", -Constants.PONTY_MARKUP],
    ["tshirt8", -Constants.PONTY_MARKUP],
    ["tshirt88", -Constants.PONTY_MARKUP],
    ["tshirt9", -Constants.PONTY_MARKUP],
    ["vhammer", -Constants.PONTY_MARKUP],
    ["vorb", -Constants.PONTY_MARKUP],
    ["warpvest", -Constants.PONTY_MARKUP],
    ["wblade", 100_000_000],
    ["wbook1", -Constants.PONTY_MARKUP],
    ["xshield", -Constants.PONTY_MARKUP],
    ["zapper", -Constants.PONTY_MARKUP]
])

export type MerchantMoveStrategyOptions = {
    /** If enabled, we will log debug messages */
    debug?: true
    /** The default position to stand when upgrading / waiting for things to do */
    defaultPosition: IPosition
    /** If enabled, the merchant will
     *  - find the lowest level piece of armor that's lower than the level set on the bots running in the given contexts
     *  - buy and upgrade store armor (helmet, coat, pants, boots, and gloves) until it's 1 level higher than what's currently equipped
     *  - apply the correct scroll for the character type
     *  - deliver it and equip it
     */
    enableBuyAndUpgrade?: {
        upgradeToLevel: number
    }
    /** If enabled, the merchant will
     *  - buy replenishables in the list for the bots running in the given contexts if they get below the replenish ratio
     */
    enableBuyReplenishables?: {
        all: Map<ItemName, number>
        merchant?: Map<ItemName, number>
        ratio: number
    }
    /** If enabled, the merchant will
     * - if they have the required amount of each exchangeable
     *   - move to where they can exchange the item(s)
     *   - exchange the item(s)
     */
    enableExchange?: {
        items: Set<ItemName>
    }
    /** If enabled, the merchant will
     * - make a rod if it doesn't have one
     * - go fishing
     */
    enableFishing?: true
    /** If enabled, the merchant will
     * - join all giveaways it sees that it's not currently a part of
     */
    enableJoinGiveaways?: true
    /** If enabled, the merchant will
     * - make a pickaxe if it doesn't have one
     * - go mining
     */
    enableMining?: true
    /** If enabled, the merchant will
     * - mluck based on the options
     */
    enableMluck?: {
        /** Should we mluck those that we pass through `contexts`? */
        contexts?: true
        /** Should we mluck others? */
        others?: true
        /** Should we mluck ourself? */
        self?: true
        /** Should we travel to mluck our own characters and others? */
        travel?: true
    }
    /** If enabled, the merchant will
     * - grab items off the bots running in the given contexts if they drop below `esize` free inventory slots.
     * - give or take gold so the bots in the given contexts will have `goldToHold` gold
     * - take items not in the `itemsToHold` set
     */
    enableOffload?: {
        esize: number
        goldToHold: number
        itemsToHold: Set<ItemName>
    }
    /** If enabled, the merchant will
     * - upgrade spare items
     */
    enableUpgrade?: true
    goldToHold: number
    itemsToHold: Set<ItemName>
}

export const DEFAULT_MERCHANT_MOVE_STRATEGY_OPTIONS: MerchantMoveStrategyOptions = {
    debug: true,
    defaultPosition: {
        map: "main",
        x: 0,
        y: 0
    },
    enableBuyReplenishables: {
        all: DEFAULT_REPLENISHABLES,
        merchant: DEFAULT_MERCHANT_REPLENISHABLES,
        ratio: DEFAULT_REPLENISH_RATIO
    },
    enableExchange: {
        items: DEFAULT_EXCHANGEABLES
    },
    enableFishing: true,
    enableJoinGiveaways: true,
    enableMining: true,
    enableMluck: {
        contexts: true,
        others: true,
        self: true,
        travel: true
    },
    enableOffload: {
        esize: 3,
        goldToHold: DEFAULT_GOLD_TO_HOLD,
        itemsToHold: DEFAULT_ITEMS_TO_HOLD
    },
    goldToHold: DEFAULT_GOLD_TO_HOLD,
    itemsToHold: MERCHANT_ITEMS_TO_HOLD
}

export class MerchantStrategy implements Strategy<Merchant> {
    public loops = new Map<LoopName, Loop<Merchant>>()

    protected contexts: Strategist<PingCompensatedCharacter>[]

    protected options: MerchantMoveStrategyOptions

    protected itemCounts: ItemCount[] = []
    protected toUpgrade: IndexesToCompoundOrUpgrade = []

    public constructor(contexts: Strategist<PingCompensatedCharacter>[], options: MerchantMoveStrategyOptions = DEFAULT_MERCHANT_MOVE_STRATEGY_OPTIONS) {
        this.contexts = contexts
        this.options = options

        this.loops.set("move", {
            fn: async (bot: Merchant) => { await this.move(bot) },
            interval: 250
        })

        if (this.options.enableMluck) {
            this.loops.set("mluck", {
                fn: async (bot: Merchant) => { await this.mluck(bot) },
                interval: ["mluck"]
            })
        }

        if (this.options.enableUpgrade) {
            this.loops.set("compound", {
                fn: async (bot: Merchant) => { await this.compound(bot) },
                interval: 250
            })
            this.loops.set("upgrade", {
                fn: async (bot: Merchant) => { await this.upgrade(bot) },
                interval: 250
            })
        }
    }

    protected async move(bot: Merchant) {
        try {
            // pass if dead
            if (bot.rip) return

            // Emergency banking if full
            if (bot.esize <= 1) return this.emergencyBanking(bot)

            // Move things from "overflow" slots
            await this.overflow(bot)

            // Do banking if we have a lot of gold, or it's been a while (15 minutes)
            if (
                (bot.gold > (this.options.goldToHold * 2))
                || (bot.esize < 2 && !this.toUpgrade.length)
                || checkOnlyEveryMS(`${bot.id}_banking`, 900_000)
            ) {
                await this.banking(bot)
            }

            // Join available giveaways
            if (this.options.enableJoinGiveaways) {
                await this.joinGiveaways(bot)
            }

            // take care of replenishables
            if (this.options.enableBuyReplenishables) {
                await this.replenish(bot)
            }

            // offload contexts
            if (this.options.enableOffload) {
                await this.offload(bot)
                // return if necessary so we can deal with full inventory
                if (bot.esize <= 3) return
            }

            // go fishing
            if (this.options.enableFishing && bot.canUse("fishing", { ignoreEquipped: true, ignoreLocation: true })) {
                return this.fish(bot)
            }

            // go mining
            if (this.options.enableMining && bot.canUse("mining", { ignoreEquipped: true, ignoreLocation: true })) {
                return this.mine(bot)
            }

            // equip broom for move speed
            await this.getBroom(bot)

            // handle mluck travel logic
            if (this.options.enableMluck) {
                await this.travelForMluck(bot)
            }

            // handle exchange
            if (this.options.enableExchange) {
                await this.exchange(bot)
            }

            // handle buy-and-upgrade logic
            if (this.options.enableBuyAndUpgrade) {
                await this.buyAndUpgrade(bot)
            }

            // go to idle position
            return bot.smartMove(this.options.defaultPosition)
        } catch (e) {
            bot.error(e)
        }
    }

    protected async mluck(bot: Merchant) {
        if (!bot.canUse("mluck")) return

        const options = this.options.enableMluck

        // mluck ourself
        if (options.self &&                 // if self-mluck is enabled
            (!bot.s.mluck                   // AND
            || bot.s.mluck.f !== bot.id     // we don't have mluck, our mluck is not from us, OR our mluck has 5s or less left
            || bot.s.mluck.ms <= 5_000)) {  // THEN
            return bot.mluck(bot.id)        // we mluck ourself
        }

        // mluck contexts
        if (options.contexts) {
            for (const context of this.contexts) {
                if (!context.isReady()) continue // context is disconnected?
                const friend = context.bot
                if (friend.serverData.region !== bot.serverData.region || friend.serverData.name !== bot.serverData.name) continue // on a different server
                if (Tools.distance(bot, friend) > bot.G.skills.mluck.range) continue // too far away to mluck

                if (!friend.s.mluck) return bot.mluck(friend.id) // they don't have mluck
                if (friend.s.mluck.strong) {
                    if (friend.s.mluck.f !== bot.id) continue // can't be stolen
                    if (friend.s.mluck.ms > (bot.G.skills.mluck.duration / 2)) continue // still plenty of time left
                }

                return bot.mluck(friend.id)
            }
        }

        // mluck others
        if (options.others) {
            for (const player of bot.getPlayers({ isNPC: false, withinRange: "mluck" })) {
                if (!player.s.mluck) return bot.mluck(player.id) // they don't have mluck
                if (player.s.mluck.strong) {
                    if (player.s.mluck.f !== bot.id) continue // can't be stolen
                    if (player.s.mluck.ms > (bot.G.skills.mluck.duration / 2)) continue // still plenty of time left
                }

                return bot.mluck(player.id)
            }
        }
    }

    protected async compound(bot: Merchant) {
        if (bot.map.startsWith("bank")) return // can't compound in bank
        if (this.toUpgrade === undefined || this.toUpgrade.length == 0) return // nothing to compound
        if (bot.s.penalty_cd && bot.map == "main") return // recently moved through a door into main (potentially from bank) and that's pretty glitchy

        const compounds = this.toUpgrade.filter(i => i.length == 3)

        for (let i = 0; i < compounds.length; i++) {
            const indexes = compounds[i]
            const items = [bot.items[indexes[0]], bot.items[indexes[1]], bot.items[indexes[2]]]
            if (!items[0] || !items[1] || !items[2]) {
                bot.debug("Compound - Item - No item to compound??")
                continue
            }
            if (!(items[0].name === items[1].name && items[1].name === items[2].name)) {
                bot.debug("Compound - Item - Can't compound different items??")
                continue
            }
            if (!(items[0].level === items[1].level && items[1].level === items[2].level)) {
                bot.debug("Compound - Item - Can't compound items of different levels??")
                continue
            }
            const item = items[0]
            const offering = getOfferingToUse(item)
            if (offering && !bot.hasItem(offering)) {
                bot.debug(`Compound - Offering - We don't have a '${offering}' to compound ${item.name}+${item.level}`)
                continue
            }
            const grade = bot.calculateItemGrade(item)
            if (grade === undefined) {
                bot.debug(`Compound - Couldn't compute grade for ${item.name}`)
                continue
            }
            const scroll = `cscroll${grade}` as ItemName
            if (!bot.hasItem(scroll)) {
                if (bot.canBuy(scroll)) {
                    bot.debug(`Compound - Scroll - Buying '${scroll}' to compound ${item.name}+${item.level}`)
                    return bot.buy(scroll)
                } else {
                    bot.debug(`Compound - Scroll - We don't have a '${scroll}' to compound ${item.name}+${item.level}`)
                    continue
                }
            }
            bot.debug(`Compound - Compounding ${item.name}+${item.level} (to +${item.level + 1})`)
            if (bot.canUse("massproductionpp")) await bot.massProductionPP()
            if (bot.canUse("massproduction")) await bot.massProduction()
            return bot.compound(indexes[0], indexes[1], indexes[2], bot.locateItem(scroll), offering ? bot.locateItem(offering) : undefined)
        }
    }

    protected async upgrade(bot: Merchant) {
        if (bot.map.startsWith("bank")) return // can't upgrade in bank
        if (this.toUpgrade === undefined || this.toUpgrade.length == 0) return // nothing to upgrade
        if (bot.s.penalty_cd && bot.map == "main") return // recently moved through a door into main (potentially from bank) and that's pretty glitchy

        const upgrades = this.toUpgrade.filter(i => i.length == 1).flat()

        for (let i = 0; i < upgrades.length; i++) {
            const item = bot.items[upgrades[i]]
            const offering = getOfferingToUse(item)
            if (offering && !bot.hasItem(offering)) {
                bot.debug(`Upgrade - Offering - We don't have a '${offering}' to upgrade ${item.name}+${item.level}`)
                continue
            }
            const grade = bot.calculateItemGrade(item)
            if (grade === undefined) {
                bot.debug(`Upgrade - Item - Couldn't compute grade for ${item.name}+${item.level}`)
                continue
            }
            const scroll = `scroll${grade}` as ItemName
            if (!bot.hasItem(scroll)) {
                if (bot.canBuy(scroll)) {
                    bot.debug(`Upgrade - Scroll - Buying '${scroll}' to upgrade ${item.name}+${item.level}`)
                    return bot.buy(scroll)
                } else {
                    bot.debug(`Upgrade - Scroll - We don't have a '${scroll}' to upgrade ${item.name}+${item.level}`)
                    continue
                }
            }
            bot.debug(`Upgrade - Upgrading ${item.name}+${item.level} (to ${item.level + 1})`)
            if (bot.canUse("massproductionpp")) await bot.massProductionPP()
            if (bot.canUse("massproduction")) await bot.massProduction()
            return bot.upgrade(upgrades[i], bot.locateItem(scroll), offering ? bot.locateItem(offering) : undefined)
        }
    }

    private async emergencyBanking(bot: Merchant) {
        bot.debug("Doing Emergency Banking...")
        this.toUpgrade = []
        await bot.smartMove(bankingPosition)

        // Deposit things we can stack without taking up an extra slot
        for (let i = 0; i < bot.isize; i++) {
            const item = bot.items[i]
            if (!item) continue // No item
            if (!item.q) continue // Not stackable
            if (this.options.itemsToHold.has(item.name)) continue // we want to hold this
            if (item.l) continue // item is locked

            for (const bankSlot in bot.bank) {
                // Only get stuff from the packs in the first level
                const matches = /items(\d+)/.exec(bankSlot)
                if (!matches || Number.parseInt(matches[1]) > 7) continue

                for (let j = 0; j < bot.bank[bankSlot as BankPackName].length; j++) {
                    const bankItem = bot.bank[bankSlot as BankPackName][j]
                    if (!bankItem) continue // No item
                    if (bankItem.name !== item.name) continue // different item
                    if ((item.q + bankItem.q) > bot.G.items[bankItem.name].s) continue // Depositing here would exceed stack limit
                    await bot.depositItem(i, bankSlot as BankPackName, j).catch(bot.error)
                }
            }
        }

        this.itemCounts = await getItemCountsForEverything(bot.owner)

        // Withdraw things that we can upgrade
        if (this.options.enableUpgrade) {
            this.toUpgrade = await getItemsToCompoundOrUpgrade(bot, this.itemCounts)
        }

        // Withdraw extra gold
        if (bot.bank.gold >= this.options.goldToHold) await bot.withdrawGold(this.options.goldToHold)

        // Go to our default position and wait for items to poof
        await bot.smartMove(this.options.defaultPosition)
        return sleep(60_000)
    }

    private async overflow(bot: Merchant) {
        for (let i = bot.isize; i < bot.items.length; i++) {
            let free: number
            for (let j = 0; j < bot.isize; j++) {
                const item = bot.items[j]
                if (!item) {
                    free = j
                    break
                }
            }
            if (free !== undefined) {
                await bot.swapItems(i, free)
            } else {
                break
            }
        }
    }

    private async banking(bot: Merchant) {
        bot.debug("Doing Normal Banking...")

        // Move to town first to allow us to sell unwanted items
        await bot.smartMove("main")

        // Go to bank to bank things
        this.toUpgrade = []
        await bot.smartMove(bankingPosition)
        this.itemCounts = await getItemCountsForEverything(bot.owner)

        for (let i = 0; i < bot.isize; i++) {
            const item = bot.items[i]
            if (!item) continue // no item
            if (item.l) continue // item is locked
            if (this.options.itemsToHold.has(item.name)) continue // want to hold this item
            await bot.depositItem(i).catch(bot.error)
        }

        // withdraw things we can upgrade
        if (this.options.enableUpgrade) {
            bot.debug("Banking - Looking for items to compound or upgrade...")
            this.toUpgrade = await getItemsToCompoundOrUpgrade(bot, this.itemCounts)
        }

        // Move back to first level
        if (bot.map !== "bank") {
            bot.debug("Banking - moving back to main floor...")
            await bot.smartMove(bankingPosition)
        }

        // Optimize bank slots by creating maximum stacks
        bot.debug("Banking - Optimizing bank")
        // Create the list of duplicate items
        const stackList: { [T in ItemName]?: [BankPackName, number, number][] } = {}
        for (const bankSlot in bot.bank) {
            if (!bankSlot.includes("items")) continue // only do item packs

            for (let i = 0; i < bot.bank[bankSlot as BankPackName].length; i++) {
                const item = bot.bank[bankSlot as BankPackName][i]
                if (!item) continue // no item
                if (!item.q) continue // not stackable
                if (item.q >= bot.G.items[item.name].s) continue // maximum stack size already reached
                if (!stackList[item.name]) stackList[item.name] = []
                stackList[item.name].push([bankSlot as BankPackName, i, item.q])
            }
        }

        // remove items with only one stack
        for (const itemName in stackList) {
            const items = stackList[itemName]
            if (items.length == 1) delete stackList[itemName]
        }

        // consolidate stacks
        for (const itemName in stackList) {
            if (bot.esize < 3) break // not enough space to consolidate things
            const stacks = stackList[itemName as ItemName]
            const stackLimit = bot.G.items[itemName as ItemName].s as number
            for (let j = 0; j < stacks.length - 1; j++) {
                // We can stack!
                bot.debug(`Optimizing stacks of ${itemName}...`)
                const stack1 = stacks[j]
                const stack2 = stacks[j + 1]

                if (j == 0) await bot.withdrawItem(stack1[0], stack1[1]).catch(bot.error)
                await bot.withdrawItem(stack2[0], stack2[1]).catch(bot.error)
                const items = bot.locateItems(itemName as ItemName, bot.items, { quantityLessThan: stackLimit })
                if (items.length > 1) {
                    const item1 = bot.items[items[0]]
                    if (!item1) break
                    const q1 = item1.q
                    const item2 = bot.items[items[1]]
                    if (!item2) break
                    const q2 = item2.q

                    const split = stackLimit - q1
                    if (q2 <= split) {
                        // Just move them to stack them
                        await bot.swapItems(items[0], items[1])
                        continue
                    } else {
                        // Split the stack so we can make a full stack
                        await bot.splitItem(items[1], split)
                        const newStack = await bot.locateItem(itemName as ItemName, bot.items, { quantityGreaterThan: split - 1, quantityLessThan: split + 1 })
                        if (newStack === undefined) continue
                        await bot.swapItems(newStack, items[0])

                        // deposit full stack
                        if (!this.options.itemsToHold.has(itemName as ItemName)) await bot.depositItem(items[0])
                        break
                    }
                }
            }
        }

        // withdraw exchangable
        if (this.options.enableExchange && bot.esize >= 3) {
            bot.debug("Banking - Looking for exchangables...")
            for (const item of this.options.enableExchange.items) {
                const options: LocateItemsFilters = {
                    locked: false,
                    quantityGreaterThan: (bot.G.items[item].e ?? 1) - 1
                }
                await withdrawItemFromBank(bot, item, options, { freeSpaces: 3, itemsToHold: this.options.itemsToHold })
                if (bot.hasItem(item, bot.items, options)) break // we found something to exchange
            }
        }

        // obtain/deposit gold
        if (bot.gold > this.options.goldToHold) {
            await bot.depositGold(bot.gold - this.options.goldToHold)
        } else if (bot.gold < this.options.goldToHold && bot.bank.gold > 0) {
            await bot.withdrawGold(Math.min(this.options.goldToHold - bot.gold, bot.bank.gold))
        }

        // sort inventory
        await sortInventory(bot)

        // sort bank
        await sortBank(bot)

        // return to main
        await bot.smartMove("main")
    }

    private async joinGiveaways(bot: Merchant) {
        for (const player of bot.getPlayers({ withinRange: Constants.NPC_INTERACTION_DISTANCE })) {
            for (const s in player.slots) {
                const slot = s as TradeSlotType
                const item = player.slots[slot]
                if (!item) continue // empty slot
                if (!item.giveaway) continue // not a giveaway item
                if (item.list && item.list.includes(bot.id)) continue // we've already joined
                await bot.joinGiveaway(slot, player.id, item.rid)
            }
        }
    }

    private async replenish(bot: Merchant) {
        // take care of friends' replenishables
        for (const context of this.contexts) {
            if (!context.isReady()) continue
            const friend = context.bot
            if (friend.id == bot.id) continue // we'll take care of ourself later
            if (friend.serverData.region !== bot.serverData.region || friend.serverData.name !== bot.serverData.name) continue // Different server
            for (const [item, numTotal] of this.options.enableBuyReplenishables.all) {
                const numFriendHas = friend.countItem(item)
                if (numFriendHas == 0 && friend.esize == 0) continue // friend has no space for item
                if (numFriendHas > numTotal * this.options.enableBuyReplenishables.ratio) continue // they still have plenty

                const numWeHave = bot.countItem(item)
                const numFriendNeeds = numTotal - numFriendHas
                const numToBuy = numFriendNeeds - numWeHave

                // Go buy the item
                if (numToBuy > 0) {
                    if (!bot.canBuy(item, { ignoreLocation: true, quantity: numToBuy })) continue // we can't buy as many as needed
                    if (!bot.hasItem(["computer", "supercomputer"])) { // move to npc if we can't buy from where we are
                        bot.debug(`Replenishables - Moving to buy ${item}x${numToBuy}`)
                        await bot.smartMove(item, { getWithin: Constants.NPC_INTERACTION_DISTANCE / 2 })
                    }
                    bot.debug(`Replenishables - Buying ${item}x${numToBuy}`)
                    if (bot.canBuy(item, { quantity: numToBuy })) await bot.buy(item, numToBuy)
                }

                // Go deliver the item
                bot.debug(`Replenishables - Delivering ${item}x${numFriendNeeds} to ${friend.id}`)
                await bot.smartMove(friend, { getWithin: 25 })
                if (Tools.squaredDistance(bot, friend) > Constants.NPC_INTERACTION_DISTANCE_SQUARED) {
                    // We're not near them, so they must have moved, return so we can try again next loop
                    return
                }
                await bot.sendItem(friend.id, bot.locateItem(item, bot.items), numFriendNeeds)
            }
        }

        // Buy replenishables for ourself
        if (this.options.enableBuyReplenishables.merchant) {
            for (const [item, numTotal] of this.options.enableBuyReplenishables.merchant) {
                const numHave = bot.countItem(item)
                if (numHave >= numTotal) continue // we have enough
                const numToBuy = numTotal - numHave
                if (!bot.canBuy(item, { quantity: numToBuy })) continue // can't buy right now
                await bot.buy(item, numToBuy)
            }
        }
    }

    private async offload(bot: Merchant) {
        for (const context of this.contexts) {
            if (!context.isReady()) continue
            const friend = context.bot
            if (friend == bot) continue // skip ourself
            if (friend.serverData.region !== bot.serverData.region || friend.serverData.name !== bot.serverData.name) continue // different server
            if (friend.gold < (this.options.enableOffload.goldToHold * 2)) { // they don't have extra gold
                if (friend.esize > this.options.enableOffload.esize) continue // they don't have too many items

                // Check if they have items we can grab
                let skipItems = true
                for (let i = 0; i < friend.isize; i++) {
                    const item = friend.items[i]
                    if (!item) continue // no item
                    if (item.l) continue // locked item
                    if (this.options.enableOffload.itemsToHold.has(item.name)) continue // We want them to hold this item
                    skipItems = false
                    break
                }
                if (skipItems) continue
            }

            // Go find them
            bot.debug(`Offload - Moving to ${friend.id} to offload things`)
            await bot.smartMove(friend, { getWithin: 25 })
            if (Tools.squaredDistance(bot, friend) > Constants.NPC_INTERACTION_DISTANCE_SQUARED) {
                // We aren't near them; they must have moved
                // return so we can try again next loop
                return
            }

            // Grab any extra gold they have
            const extraGold = friend.gold - this.options.enableOffload.goldToHold
            if (extraGold > 0) {
                bot.debug(`Offload - Taking ${extraGold} gold from ${friend.id}.`)
                await friend.sendGold(bot.id, extraGold)
            } else if (extraGold < 0 && bot.gold > -extraGold) {
                // Send them some gold to maintain their wallet
                bot.debug(`Offload - Giving ${-extraGold} gold to ${friend.id}.`)
                await bot.sendGold(friend.id, -extraGold)
            }

            // Grab items
            bot.debug(`Offload - Taking items from ${friend.id}.`)
            for (let i = 0; i < friend.isize && bot.esize > 0; i++) {
                const item = friend.items[i]
                if (!item) continue // no item
                if (item.l) continue // locked item
                if (this.options.enableOffload.itemsToHold.has(item.name)) continue
                await friend.sendItem(bot.id, i, item.q)
            }
        }
    }

    private async fish(bot: Merchant) {
        bot.debug("Going Fishing...")
        const rodItems = new Set<ItemName>([...this.options.itemsToHold, "rod", "spidersilk", "staff"])

        // if we don't have rod
        if (!bot.hasItem("rod") && !bot.isEquipped("rod")) {
            bot.debug("Fishing - Looking for a rod in the bank")
            // We don't have a rod, see if there's one in our bank
            await bot.smartMove(bankingPosition)
            await withdrawItemFromBank(bot, "rod", {}, {
                freeSpaces: bot.esize,
                itemsToHold: rodItems
            })

            // if we don't have rod nor spidersilk
            if (!bot.hasItem("rod") && !bot.hasItem("spidersilk")) {
                bot.debug("Fishing - Looking for spidersilk in the bank")
                // We didn't find one in our bank, see if we have spider silk to make one
                await withdrawItemFromBank(bot, "spidersilk", {}, {
                    freeSpaces: bot.esize,
                    itemsToHold: rodItems
                })

                // if we have spidersilk but don't have a staff
                if (bot.hasItem("spidersilk") && !bot.hasItem("staff", bot.items, { level: 0, locked: false })) {
                    bot.debug("Fishing - Looking for a staff in the bank")
                    // We found spidersilk, see if we have a staff too
                    await withdrawItemFromBank(bot, "staff", { level: 0, locked: false }, {
                        freeSpaces: bot.esize,
                        itemsToHold: rodItems
                    })

                    if (!bot.hasItem("staff")) {
                        bot.debug("Fishing - Buying a staff")
                        // We didn't find a staff, but we can go buy one
                        await bot.smartMove("staff", { getWithin: 50 })
                        await sleep(Math.max(2000, bot.s.penalty_cd?.ms ?? 0)) // The game can still think you're in the bank for a while
                        await bot.buy("staff")
                    }

                    // if we can craft rod
                    if (bot.canCraft("rod", { ignoreLocation: true })) {
                        // We can make a rod, let's go do that
                        if (!bot.hasItem(["computer", "supercomputer"])) {
                            bot.debug("Fishing - Moving to craftsman to craft rod")
                            await bot.smartMove("craftsman", { getWithin: Constants.NPC_INTERACTION_DISTANCE - 50 })
                        }
                        await bot.craft("rod")
                    }
                }
            }
        }

        // if we have rod and are far from fishing spot
        if (bot.isEquipped("rod") || bot.hasItem("rod") && Tools.distance(bot, mainFishingSpot) > 10) {
            bot.debug("Fishing - Moving to fishing spot")
            // TODO: find closest fishing spot
            await bot.smartMove(mainFishingSpot, { costs: { transport: 9999 } })
        }

        // if we have rod but not equipped
        if (!bot.isEquipped("rod") && bot.hasItem("rod")) {
            bot.debug("Fishing - Equipping our rod")
            // Equip the rod if we don't already have it equipped
            const rod = bot.locateItem("rod", bot.items, { returnHighestLevel: true })
            if (bot.slots.offhand) await bot.unequip("offhand")
            await bot.equip(rod)
        }

        // Wait a bit if we're on cooldown
        if (bot.s.penalty_cd) await sleep(bot.s.penalty_cd.ms)

        if (bot.canUse("fishing")) {
            bot.debug("Fishing - Casting our rod!")
            const result = await bot.fish()
            return bot.debug(`Fishing - Outcome: ${result}`)
        }
    }

    private async mine(bot: Merchant) {
        bot.debug("Going Mining...")
        const pickaxeItems = new Set<ItemName>([...this.options.itemsToHold, "pickaxe", "spidersilk", "staff", "blade"])

        // if we don't have a pickaxe
        if (!bot.hasItem("pickaxe") && !bot.isEquipped("pickaxe")) {
            bot.debug("Mining - Looking for a pickaxe in the bank")
            // We don't have a pickaxe, see if there's one in our bank
            await bot.smartMove(bankingPosition)
            await withdrawItemFromBank(bot, "pickaxe", {}, {
                freeSpaces: bot.esize,
                itemsToHold: pickaxeItems
            })

            // if we have neither pickaxe nor spidersilk
            if (!bot.hasItem("pickaxe") && !bot.hasItem("spidersilk")) {
                bot.debug("Mining - Looking for spidersilk in the bank")
                // We didn't find a pickaxe, see if we have spider silk to make one
                await withdrawItemFromBank(bot, "spidersilk", {}, {
                    freeSpaces: bot.esize,
                    itemsToHold: pickaxeItems
                })

                if (bot.hasItem("spidersilk")) {
                    const opts = { level: 0, locked: false }
                    let hasBlade, hasStaff
                    // We found spider silk, but have no blade/staff; see if we have them in bank
                    if (!bot.hasItem("staff", bot.items, opts)) {
                        bot.debug("Mining - Looking for staff in the bank")
                        await withdrawItemFromBank(bot, "staff", opts, {
                            freeSpaces: bot.esize,
                            itemsToHold: pickaxeItems
                        })
                        hasStaff = bot.hasItem("staff", bot.items, opts)
                    }
                    if (!bot.hasItem("blade", bot.items, opts)) {
                        bot.debug("Mining - Looking for blade in the bank")
                        await withdrawItemFromBank(bot, "blade", opts, {
                            freeSpaces: bot.esize,
                            itemsToHold: pickaxeItems
                        })
                        hasBlade = bot.hasItem("blade", bot.items, opts)
                    }

                    if (!hasStaff || !hasBlade) {
                        bot.debug("Mining - Buying staff and/or blade")
                        await bot.smartMove("staff", { getWithin: 50 })
                        await sleep(Math.max(2000, bot.s.penalty_cd?.ms ?? 0))
                        if (!hasStaff) await bot.buy("staff")
                        if (!hasBlade) await bot.buy("blade")
                    }

                    if (bot.canCraft("pickaxe", { ignoreLocation: true })) {
                        if (!bot.hasItem(["computer", "supercomputer"])) {
                            bot.debug("Mining - Moving to craftsman to craft pickaxe")
                            await bot.smartMove("craftsman", { getWithin: Constants.NPC_INTERACTION_DISTANCE - 50 })
                        }
                        await bot.craft("pickaxe")
                    }
                }
            }
        }

        if (bot.isEquipped("pickaxe") || bot.hasItem("pickaxe") && Tools.distance(bot, miningSpot) > 10) {
            bot.debug("Mining - Moving to mining spot")
            await bot.smartMove(miningSpot)
        }

        if (!bot.isEquipped("pickaxe") && bot.hasItem("pickaxe")) {
            bot.debug("Mining - Equipping our pickaxe")
            const pickaxe = bot.locateItem("pickaxe", bot.items, { returnHighestLevel: true })
            if (bot.slots.offhand) await bot.unequip("offhand")
            await bot.equip(pickaxe)
        }

        if (bot.s.penalty_cd) await sleep(bot.s.penalty_cd.ms)

        if (bot.canUse("mining")) {
            bot.debug("Mining - Swinging our pickaxe!")
            const result = await bot.mine()
            return bot.debug(`Mining - Outcome: ${result}`)
        }
    }

    private async getBroom(bot: Merchant) {
        if (bot.isEquipped("broom")) {
            if (!bot.hasItem("broom")) return
            const i = bot.locateItem("broom", bot.items, { returnHighestLevel: true })
            const broom = bot.items[i]
            if (bot.slots.mainhand.name == broom.name && bot.slots.mainhand.level >= broom.level) return
            return bot.equip(i)
        }

        if (bot.hasItem("broom")) {
            const broom = bot.locateItem("broom", bot.items, { returnHighestLevel: true })
            return bot.equip(broom)
        }
    }

    private async travelForMluck(bot: Merchant) {
        const opts = this.options.enableMluck

        if (!opts.travel) return

        if (opts.contexts) {
            for (const context of this.contexts) {
                if (!context.isReady()) continue
                const friend = context.bot

                if (friend.serverData.region !== bot.serverData.region || friend.serverData.name !== bot.serverData.name) continue // different server
                if (
                    bot.s.mluck // They have mluck
                    && bot.s.mluck.f == bot.id // It's from us
                    && bot.s.mluck.ms > 900_000 // there's 15 minutes or more left
                ) continue // ignore
                if (
                    bot.s.mluck // They have mluck
                    && bot.s.mluck.f !== bot.id // It's not from us
                    && bot.s.mluck.strong // It's strong
                ) continue // Ignore because we can't steal it
                bot.debug(`Move - mluck - Moving to ${friend.name} to mluck them`)
                await bot.smartMove(friend, { getWithin: bot.G.skills.mluck.range / 2 })
                // Wait a bit if we had to enter a door
                if (bot.s.penalty_cd) await sleep(bot.s.penalty_cd.ms + 1000)
                return
            }
        }

        if (opts.others) {
            const player = await PlayerModel.findOne({
                $or: [
                    { "s.mluck": undefined }, // They don't have mluck
                    { "s.mluck.f": { "$ne": bot.id }, "s.mluck.strong": undefined } // we can steal mluck
                ],
                lastSeen: { $gt: Date.now() - 30000 },
                serverIdentifier: bot.server.name,
                serverRegion: bot.server.region },
            {
                _id: 0,
                map: 1,
                name: 1,
                x: 1,
                y: 1
            }).lean().exec()
            if (player) {
                bot.debug(`Move - mluck - Moving to ${player.name} to mluck them`)
                await bot.smartMove(player, { getWithin: bot.G.skills.mluck.range / 2 })
                // Wait a bit if we had to enter a door
                if (bot.s.penalty_cd) await sleep(bot.s.penalty_cd.ms + 1000)
                return
            }
        }
    }

    private async exchange(bot: Merchant) {
        const exchangeables = this.options.enableExchange.items

        for (let i = 0; i < bot.isize && bot.esize > 1; i++) {
            const item = bot.items[i]
            if (!item) continue // no item
            if (item.l) continue // locked item
            if (!exchangeables.has(item.name)) continue // not an exchangeable, or we don't want to exchange it
            if ((item.q ?? 1) < (bot.G.items[item.name].e ?? 1)) continue // we don't have enough to exchange
            if (!bot.hasItem(["computer", "supercomputer"])) {
                // Walk to the npc
                const npc = Pathfinder.locateExchangeNPC(item.name)
                bot.debug(`Move - Exchange - Moving to NPC to exchange ${item.name}`)
                await bot.smartMove(npc, { getWithin: Constants.NPC_INTERACTION_DISTANCE - 50 })
            }
            return bot.exchange(i).catch(bot.error)
        }
    }

    private async buyAndUpgrade(bot: Merchant) {
        const limit = this.options.enableBuyAndUpgrade.upgradeToLevel

        let lowestItemSlot: SlotType
        let lowestItemLevel: number = Number.MAX_SAFE_INTEGER
        let getFor: Character
        itemSearch:
        for (const context of this.contexts) {
            if (!context.isReady()) continue
            const friend = context.bot
            if (friend == bot) continue // skip ourself
            if (friend.serverData.region !== bot.serverData.region || friend.serverData.name !== bot.serverData.name) continue // different server
            for (const sN in friend.slots) {
                const slotName = sN as SlotType
                if (slotName.startsWith("trade")) continue // ignore trade slots
                if (!(["chest", "gloves", "helmet", "mainhand", "pants", "shoes"]).includes(slotName)) continue
                const slot = friend.slots[slotName]
                if (!slot) {
                    // We have nothing in this slot, let's get something for it
                    lowestItemSlot = slotName
                    lowestItemLevel = 0
                    getFor = friend
                    break itemSearch
                }
                if (slot.level > limit) continue // We already have something pretty good
                if (slot.level >= lowestItemLevel) continue // We have already found something at a lower level

                // We found a new low
                lowestItemLevel = slot.level
                lowestItemSlot = slotName
                getFor = friend
            }
        }

        // Buy and upgrade the store-level item to a higher level to replace it
        if (lowestItemSlot) {
            let item: ItemName
            switch (lowestItemSlot) {
                case "chest":
                    item = "coat"
                    break
                case "gloves":
                case "helmet":
                case "pants":
                case "shoes":
                    item = lowestItemSlot as ItemName
                    break
                case "mainhand":
                    // Get the item that will attack the fastest
                    switch (getFor.ctype) {
                        case "mage":
                        case "priest":
                            item = "wand"
                            break
                        case "paladin":
                            item = "mace"
                            break
                        case "ranger":
                            item = "bow"
                            break
                        case "rogue":
                            item = "blade"
                            break
                        case "warrior":
                            item = "claw"
                            break
                    }
                    break
            }

            // If we have a higher level item, make sure it has the correct scroll, then go deliver and equip it
            const potential = bot.locateItem(item, bot.items, { levelGreaterThan: lowestItemLevel, returnHighestLevel: true })
            if (potential !== undefined) {
                // Apply the correct stat scroll if we need
                const itemData = bot.items[potential]
                const stat = bot.G.items[item].stat ? bot.G.classes[getFor.ctype].main_stat : undefined
                if (itemData.stat_type !== stat) {
                    // Go to the upgrade NPC
                    if (!bot.hasItem(["computer", "supercomputer"])) {
                        await bot.smartMove("newupgrade", { getWithin: 25 })
                    }

                    // Buy the correct stat scroll(s) and apply them
                    const grade = bot.calculateItemGrade(itemData)
                    const statScroll = `${stat}scroll` as ItemName
                    const numNeeded = Math.pow(10, grade)
                    const numHave = bot.countItem(statScroll, bot.items)

                    try {
                        if (numNeeded > numHave) {
                            await bot.buy(statScroll, numNeeded - numHave)
                        }
                        const statScrollPosition = bot.locateItem(statScroll)
                        await bot.upgrade(potential, statScrollPosition)
                    } catch (e) {
                        bot.error(e)
                    }
                }

                const potentialWithScroll = bot.locateItem(item, bot.items, { levelGreaterThan: lowestItemLevel, returnHighestLevel: true, statType: stat })
                if (potentialWithScroll !== undefined) {
                    await bot.smartMove(getFor, { getWithin: 25 })
                    if (Tools.squaredDistance(bot, getFor) > Constants.NPC_INTERACTION_DISTANCE_SQUARED) {
                        return
                    }

                    // Send and equip it
                    await bot.sendItem(getFor.id, potentialWithScroll)
                    await sleep(1000)
                    const equipItem = getFor.locateItem(item, getFor.items, { levelGreaterThan: lowestItemLevel, returnHighestLevel: true, statType: stat })
                    await getFor.equip(equipItem)

                    // Send the old item back to the merchant
                    return getFor.sendItem(bot.id, equipItem)
                }
            }

            if (!bot.hasItem(item)) {
                // Go to bank and see if we have one
                await bot.smartMove(bankingPosition)
                await withdrawItemFromBank(bot, item, { locked: false }, { freeSpaces: 2, itemsToHold: this.options.itemsToHold })
                await bot.smartMove("main")
            }

            // Go to the upgrade NPC
            if (!bot.hasItem(["computer", "supercomputer"])) {
                await bot.smartMove("newupgrade", { getWithin: 25 })
            }

            // Buy if we need
            while (bot.canBuy(item) && !bot.hasItem(item)) {
                await bot.buy(item)
            }

            // Find the lowest level item, we'll upgrade that one
            const lowestLevelPosition = bot.locateItem(item, bot.items, { returnLowestLevel: true })
            if (lowestLevelPosition === undefined) return // We probably couldn't afford to buy one
            const lowestLevel = bot.items[lowestLevelPosition].level

            // Don't upgrade if it's already the level we want
            if (lowestLevel < lowestItemLevel + 1) {
                /** Find the scroll that corresponds with the grade of the item */
                const grade = bot.calculateItemGrade(bot.items[lowestLevelPosition])
                const scroll = `scroll${grade}` as ItemName

                /** Buy a scroll if we don't have one */
                let scrollPosition = bot.locateItem(scroll)
                if (scrollPosition == undefined && bot.canBuy(scroll)) {
                    await bot.buy(scroll)
                    scrollPosition = bot.locateItem(scroll)
                }

                if (scrollPosition !== undefined) {
                    /** Speed up the upgrade if we can */
                    if (bot.canUse("massproductionpp")) await bot.massProductionPP()
                    if (bot.canUse("massproduction")) await bot.massProduction()

                    /** Upgrade! */
                    return bot.upgrade(lowestLevelPosition, scrollPosition)
                }
            }
        }
    }
}

export async function startMerchant(context: Strategist<Merchant>, friends: Strategist<PingCompensatedCharacter>[], options?: MerchantMoveStrategyOptions) {
    const itemsToBuy = new Map<ItemName, number>(DEFAULT_ITEMS_TO_BUY.entries())
    for (const [itemName, price] of itemsToBuy) {
        if (price < 0) {
            const gItem = context.bot.G.items[itemName]
            itemsToBuy.set(itemName, gItem.g * (-price))
        }
    }

    for (const iN in context.bot.G.items) {
        const itemName = iN as ItemName
        const gItem = context.bot.G.items[itemName]
        if (itemsToBuy.has(itemName)) continue // price is already set

        if (gItem.e) {
            // Buy all exchangeables
            itemsToBuy.set(itemName, gItem.g * Constants.PONTY_MARKUP)
            continue
        }

        if (gItem.type == "token") {
            // Buy all tokens
            itemsToBuy.set(itemName, gItem.g * Constants.PONTY_MARKUP)
            continue
        }

        if (gItem.type == "bank_key" || gItem.type == "dungeon_key") {
            // Buy all keys
            itemsToBuy.set(itemName, gItem.g * Constants.PONTY_MARKUP)
            continue
        }

        if (gItem.tier >= 4) {
            // Buy all super high tier items
            itemsToBuy.set(itemName, gItem.g * Constants.PONTY_MARKUP)
            continue
        }

        if (gItem.name.includes("Darkforge")) {
            // Buy all darkforge items
            itemsToBuy.set(itemName, gItem.g * Constants.PONTY_MARKUP)
            continue
        }

        // TODO: Add more logic for things to buy
    }

    context.applyStrategy(new BuyStrategy({
        buyMap: itemsToBuy,
        enableBuyForProfit: true
    }))
    context.applyStrategy(new MerchantStrategy(friends, options))
    context.applyStrategy(new TrackerStrategy())
    context.applyStrategy(new AcceptPartyRequestStrategy())
    context.applyStrategy(new BaseAttackStrategy({
        contexts: friends,
        disableBasicAttack: true
    }))
    context.applyStrategy(new ToggleStandStrategy({
        offWhenMoving: true,
        onWhenNear: [
            { distance: 10, position: options.defaultPosition }
        ]
    }))
}