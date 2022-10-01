import { PingCompensatedCharacter, ItemName, LocateItemFilters, SlotType } from "../../../../ALClient/"
import { Strategy, LoopName, Loop } from "../context.js"

export class EquipStrategy implements Strategy<PingCompensatedCharacter> {
    public loops = new Map<LoopName, Loop<PingCompensatedCharacter>>()

    public luckEquipment: { [T in SlotType]?: { name: ItemName, filters?: LocateItemFilters } }
    public damageEquipment: { [T in SlotType]?: { name: ItemName, filters?: LocateItemFilters } }

    public constructor(luckEquips: { [T in SlotType]?: { name: ItemName, filters?: LocateItemFilters } }, damageEquips: { [T in SlotType]?: { name: ItemName, filters?: LocateItemFilters } }) {
        this.luckEquipment = luckEquips
        this.damageEquipment = damageEquips

        this.loops.set("equip", {
            fn: async (bot: PingCompensatedCharacter) => { await this.equipBest(bot) },
            interval: 250
        })
    }

    public async equipBest(bot: PingCompensatedCharacter) {
        const monsters = bot.getEntities({
            targetingMe: true,
            hpLessThan: bot.attack * 5
        })

        const shouldEquipLuck = monsters.length > 0
        if (shouldEquipLuck) {
            await this.ensureEquipped(bot, this.luckEquipment)
        } else {
            await this.ensureEquipped(bot, this.damageEquipment)
        }
    }

    private async ensureEquipped(bot: PingCompensatedCharacter, equipment: { [T in SlotType]?: { name: ItemName, filters?: LocateItemFilters } }) {
        for (const s in equipment) {
            const slot = s as SlotType
            const itemName = equipment[slot].name
            if (itemName === undefined) { // Item set as "undefined" to make sure nothing is equipped
                if (bot.slots[slot]) { // if something IS equipped...
                    await bot.unequip(slot) // ...unequip it
                }
                continue
            }
            const wType = bot.G.items[itemName].wtype

            if (bot.slots[slot]?.name == itemName) {
                // We already have it equipped; see if there's a higher level item to equip
                const alternative = bot.locateItem(itemName, bot.items, { ...equipment[slot].filters, returnHighestLevel: true })
                if (alternative !== undefined && bot.items[alternative].level > bot.slots[slot].level) {
                    // We have a higher level item in our inventory, equip that instead
                    await bot.equip(alternative, slot)
                }
                continue
            }

            if (bot.G.classes[bot.ctype].doublehand[wType]) {
                // Check if we have something in our offhand; unequip it if necessary
                if (bot.slots.offhand) await bot.unequip("offhand")
            }

            if (slot == "offhand" && bot.slots["mainhand"]) {
                const mainhandItem = bot.slots["mainhand"].name
                const mainhandWType = bot.G.items[mainhandItem].wtype
                if (bot.G.classes[bot.ctype].doublehand[mainhandWType]) {
                    // We're equipping an offhand item, but we have a doublehand item equipped in our mainhand.
                    await bot.unequip("mainhand")
                }
            }

            if (!bot.slots[slot] || bot.slots[slot].name !== itemName) {
                const i = bot.locateItem(itemName, bot.items, { ...equipment[slot].filters, returnHighestLevel: true })
                if (i !== undefined) await bot.equip(i, slot)
            }
        }
    }
}