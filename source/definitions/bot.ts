import { Character, CharacterType, ItemName, Mage, Merchant, MonsterName, Paladin, Priest, Ranger, Rogue, SlotType, Warrior } from "../../../ALClient/build/index.js"

export type Strategy = {
    [T in MonsterName]?: MonsterStrategy
} & {
    defaultTarget?: MonsterName
    monsterhunt?: boolean
}

export type MerchantStrategy = {
    buy: Set<ItemName>
    compound: Set<ItemName>
    craft: Set<ItemName>
    dismantle: Set<ItemName>
    exchange: Set<ItemName>
    fight: boolean
    fish: boolean
    hold: Set<ItemName>
    list: ListInfo
    maxGold: number
    mine: boolean
    mluckStrangers: boolean
    sell: ItemLevelInfo
    upgrade: Set<ItemName>
}

export type ListInfo = {
    [T in ItemName]?: ListRules
}

export type ListRules = {
    /** level: price */
    [T in number]?: number
}

export type MonsterStrategy = {
    attack: (bot?: Character, friends?: Character[]) => Promise<void>
    move: (bot?: Character, healer?: Priest) => Promise<void>
    equipment?: EquipmentInfo
    attackWhileIdle?: boolean
    requireCtype?: CharacterType
}

export type Information = {
    friends: [Merchant, Character, Character, Character]
    merchant: {
        bot: Merchant
        name: string
        target?: MonsterName
    }
    tank: {
        bot: Paladin | Warrior
        name: string
        target: MonsterName
    }
    healer: {
        bot: Priest
        name: string
        target: MonsterName
    }
    dps: {
        bot: Mage | Ranger | Rogue
        name: string
        target: MonsterName
    }
}

export type ItemLevelInfo = {
    /** Items this level and under will be sold */
    [T in ItemName]?: number
}

export type EquipmentInfo = {
    [T in SlotType]?: ItemName
}