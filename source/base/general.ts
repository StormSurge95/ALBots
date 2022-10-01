import AL, { BankPackName, Character, Entity, GameResponseData, GMap, HitData, IEntity, InviteData, IPosition, ItemData, ItemName, ItemType, MapName, Merchant, MonsterName, NPCName, Pathfinder, Player, ServerIdentifier, ServerInfoDataLive, ServerRegion, SlotType, Tools, TradeSlotType } from "../../../ALClient/build/index.js"
import { PathfinderOptions } from "alclient/build/definitions/pathfinder"
import fs from "fs"
import { ItemLevelInfo, ListInfo } from "../definitions/bot.js"
import { bankingPosition, offsetPositionParty } from "./locations.js"
import { sortClosestDistance } from "./sort.js"

export const LOOP_MS = 100
export const CHECK_PONTY_EVERY_MS = 30_000 /** 30 seconds */
export const CHECK_TRACKER_EVERY_MS = 600_000 /** 10 minutes */

export const GOLD_TO_HOLD = 5_000_000

export const FRIENDLY_ROGUES = ["copper", "Bjarna", "RisingVanir", "DripDrop", "earthRog"]

export const MY_CHARACTERS = ["StormSurge", "WarriorSurge", "PriestSurge", "MageSurge", "RangerSurge", "RogueSurge", "PaladinSurge"]
export const EARTH_CHARACTERS = ["earthiverse", "earthMag", "earthMag2", "earthMag3", "earthMer", "earthMer2", "earthMer3", "earthPal", "earthPri", "earthPri2", "earthRan2", "earthRan3", "earthRog", "earthRog2", "earthRog3", "earthWar", "earthWar2", "earthWar3"]
export const ANNOUNCEMENT_CHARACTERS = ["announcement", "battleworthy", "charmingness", "decisiveness", "enlightening", "facilitating", "gratuitously", "hypothesized", "illumination", "journalistic", "kaleidoscope", "logistically", "mythological", "nanoparticle"]
export const KOUIN_CHARACTERS = ["bataxedude", "cclair", "fathergreen", "kakaka", "kekeke", "kouin", "kukuku", "mule0", "mule1", "mule2", "mule3", "mule5", "mule6", "mule7", "mule8", "mule9", "mule10", "piredude"]
export const LOLWUTPEAR_CHARACTERS = ["fgsfds", "fsjal", "funny", "gaben", "lolwutpear", "longcat", "morbintime", "orlyowl", "over9000", "prettysus", "rickroll", "rule34", "shoopdawhoop", "wombocombo", "ytmnd"]
export const MAIN_CHARACTERS = ["WarriorMain", "MageMain", "MerchantMain", "PriestMain", "RangerMain", "PaladinMain", "RogueMain", "RogueSub"]

export const ITEMS_TO_HOLD: Set<ItemName> = new Set([
    // Things we keep on ourselves
    "computer", "supercomputer", "tracker", "xptome",
    // Boosters
    "luckbooster", "goldbooster", "xpbooster",
    // Potions
    "hpot0", "hpot1", "mpot0", "mpot1"
])

export const ITEMS_TO_BUY: Set<ItemName> = new Set([
    // NOTE: Temporary for Christmas
    // Exchangeables
    //"5bucks", "gem0", "gem1", "gemfragment", "seashell", "leather", "candycane", "mistletoe", "ornament", "candy0", "candy1", "greenenvelope", "redenvelope", "redenvelopev2", "redenvelopev3", "redenvelopev4", "basketofeggs", "armorbox", "bugbountybox", "gift0", "gift1", "mysterybox", "weaponbox", "xbox",
    // Belts
    //"dexbelt", "intbelt", "sbelt", "strbelt",
    // Rings
    //"cring", "ctristone", "goldring", "ringofluck", "strring", "suckerpunch", "trigger", "tristone", "vring",
    // Earrings
    /*"cearring", "dexearring",*/ "lostearring",
    // Amulets
    //"amuletofm", "dexamulet", "intamulet", "mpxamulet", "northstar", "skullamulet", "snring", "t2dexamulet", "t2intamulet", "t2stramulet",
    // Orbs
    //"charmer", "ftrinket", "jacko", "orbg", "orbofdex", "orbofint", "orbofsc", "orbofstr", "rabbitsfoot", "talkingskull", "vorb",
    // Offhands
    //"exoarm", "wbook1", "wbookhs",
    // Shields
    //"t2quiver", "lantern", "mshield", "quiver", "sshield", "xshield",
    // Capes
    //"angelwings", "bcape", "cape", "ecape", "fcape", "gcape", "stealthcape", "vcape",
    // Shoes
    //"eslippers", "hboots", "mrnboots", "mwboots", "shoes1", "vboots", "wingedboots", "wshoes", "xboots",
    // Pants
    //"frankypants", "hpants", "mrnpants", "mwpants", "pants1", "starkillers", "wbreeches", "xpants",
    // Armor
    //"cdragon", "coat1", "harmor", "luckyt", "mcape", "mrnarmor", "mwarmor", "tshirt0", "tshirt1", "tshirt2", "tshirt3", "tshirt4", "tshirt6", "tshirt7", "tshirt8", "tshirt88", "tshirt9", "vattire", "warpvest", "wattire", "xarmor",
    // Helmets
    //"cyber", "eears", "fury", "helmet1", "hhelmet", "mchat", "mmhat", "mphat", "mrnhat", "mwhelmet", "oxhelmet", "partyhat", "rednose", "wcap", "xhelmet",
    // Gloves
    //"gloves1", "goldenpowerglove", "handofmidas", "hgloves", "mittens", "mpxgloves", "mrngloves", "mwgloves", "poker", "powerglove", "supermittens", "vgloves", "wgloves", "xgloves",
    // Good weapons
    //"basher", "bataxe", "bowofthedead", "candycanesword", "carrotsword", "crossbow", "dartgun", "fireblade", "firebow", "firestaff", "firestars", "frostbow", "froststaff", "gbow", "glolipop", "gstaff", "harbringer", "heartwood", "hbow", "hdagger", "merry", "ololipop", "oozingterror", "ornamentstaff", "pinkie", "pmace", "scythe", "snowflakes", "t2bow", "t3bow", "throwingstars", "vdagger", "vhammer", "vstaff", "vsword", "wblade",
    // Interesting weapons
    "broom",
    // Things we can exchange / craft with
    //"ascale", "bfur", "cscale", "cshell", "crabclaw", "electronics", "feather0", "frogt", "goldenegg", "goldingot", "goldnugget", "ink", "leather", "lotusf", "platinumingot", "platinumnugget", "pleather", "snakefang", "spores",
    // Things to make xbox
    //"x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8",
    // Things to make easter basket
    //"egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8",
    // Essences
    //"essenceofether", "essenceoffire", "essenceoffrost", "essenceofgreed", "essenceoflife", "essenceofnature", "offering", "offeringp", "offeringx",
    // Potions & consumables
    //"bunnyelixir", "candypop", "elixirdex0", "elixirdex1", "elixirdex2", "elixirint0", "elixirint1", "elixirint2", "elixirluck", "elixirstr0", "elixirstr1", "elixirstr2", "greenbomb", "hotchocolate", "vblood",
    // High level scrolls
    //"cscroll3", "scroll3", "scroll4", "forscroll", "luckscroll", "manastealscroll",
    // Merchant Tools
    //"pickaxe", "rod",
    // Keys
    //"bkey", "cryptkey", "dkey", "frozenkey", "stonekey", "tombkey", "ukey",
    // Misc. Things
    //"bottleofxp", "bugbountybox", "computer", "confetti", "cxjar", "emotionjar", "flute", "frozenstone", "monstertoken", "poison", "puppyer", "shadowstone", "snakeoil"
])

export const ITEMS_TO_LIST: ListInfo = {
    // EASTER
    "basketofeggs": {
        0: 999_999_999
    },
    "egg0": {
        0: 999_999_999
    },
    "egg1": {
        0: 999_999_999
    },
    "egg2": {
        0: 999_999_999
    },
    "egg3": {
        0: 999_999_999
    },
    "egg4": {
        0: 999_999_999
    },
    "egg5": {
        0: 999_999_999
    },
    "egg6": {
        0: 999_999_999
    },
    "egg7": {
        0: 999_999_999
    },
    "egg8": {
        0: 999_999_999
    },
    "goldenegg": {
        0: 999_999_999
    },
    "cryptkey": {
        0: 5_000_000
    },
    "frozenkey": {
        0: 7_500_000
    },
    // "monstertoken": {
    //     0: 400_000
    // },
    // "resistancering": {
    //     0: 25_000_000,
    //     1: 76_000_000,
    // },
    "tracker": {
        0: 1_600_000
    },
    "vitring": {
        2: 2_000_000
    }
}

export const ITEMS_TO_SELL: ItemLevelInfo = {
    // Things that accumulate
    "cclaw": 2, "frankypants": 2, "hpamulet": 2, "hpbelt": 2, "quiver": 2, "ringsj": 2, "slimestaff": 2, "stinger": 2, "vitearring": 2,
    "helmet1": 2, "gloves1": 2, "shoes1": 2, "pants1": 2, "coat1": 2, "vitring": 2, "cape": 2, "sword": 2, "spear": 2,
    "intamulet": 2, "dexamulet": 2, "stramulet": 2, "throwingstars": 2, "wbook0": 2,
    "wcap": 2, "wattire": 2, "wgloves": 2, "wbreeches": 2, "wshoes": 2,
    // Higher level things that accumulate
    "mcape": 2,
    // Default weapons
    "wshield": 2,
    // Default clothing
    "shoes": 2, "pants": 2, "coat": 2, "helmet": 2, "gloves": 2,
    // Things that are now obsolete
    "intearring": 2, "strearring": 2, "dexearring": 2,
    // Things in abundance during halloween
    "gphelmet": 2, "phelmet": 2,
    // Things in abundance during christmas
    "iceskates": 2, "xmace": 2,
    // Things in abundance during lunar new year
    "tigerhelmet": 2, "tigershield": 2,
    // Field generators
    "fieldgen0": 999,
    // Snowballs
    "snowball": 999
}

// Sanity check
for (const itemName in ITEMS_TO_SELL) {
    if (ITEMS_TO_BUY.has(itemName as ItemName)) {
        console.warn(`Removing ${itemName} from ITEMS_TO_SELL because it's in ITEMS_TO_BUY.`)
        delete ITEMS_TO_SELL[itemName]
    }
}

export const ITEMS_TO_UPGRADE: Set<ItemName> = new Set([
    // weapons
    "ololipop", "glolipop", "t3bow", "oozingterror", "crossbow", "basher",
    "woodensword", "firebow", "frostbow", "fireblade", "firestaff",
    // armor
    //"hhelmet", "harmor", "hgloves", "hpants", "hboots",
    "wcap", "wattire", "wgloves", "wbreeches", "wshoes",
    "bcape", "wingedboots", "xarmor", "xboots", "xgloves",
    "xhelmet", "xpants"
])

export const ITEMS_TO_COMPOUND: Set<ItemName> = new Set([
    "lostearring", "t2stramulet", "t2intamulet", "t2dexamulet",
    "jacko", "wbook1", "orbg", "ctristone"
])

export const ITEMS_TO_PRIMLING: ItemLevelInfo = {
    // Rare & important items
    "cyber": 1, "exoarm": 1, "fury": 1, "gstaff": 1, "sbelt": 0, "starkillers": 1, "suckerpunch": 1, "supermittens": 1, "t3bow": 1,
    // Rings which are slightly harder to get
    "armorring": 1, "resistancering": 1, "t2quiver": 2, "tristone": 2,
    // Don't use offeringp on rugged stuff (we get a lot from fishing)
    "coat1": 8, "gloves1": 8, "helmet1": 8, "pants1": 8, "shoes1": 8,
    // Don't use as many offeringp on heavy armor, a lot is available during events
    "harmor": 6, "hboots": 6, "hgloves": 6, "hhelmet": 6, "hpants": 6,
    // Don't use offeringp on vampire attire (we get a lot from bosses)
    "vattire": 7,
    // Misc. common stuff
    "cape": 7, "dagger": 7, "fireblade": 7, "firestaff": 7, "sword": 7, "wbook0": 4,
    // Don't use as many offeringp on Halloween stuff
    "bowofthedead": 7, "daggerofthedead": 7, "maceofthedead": 7, "pmaceofthedead": 6, "staffofthedead": 7,
    // Don't use as many offeringp on Christmas stuff
    "candycanesword": 7, "gcape": 7, "merry": 7, "ornamentstaff": 7, "xmace": 7,
}

export const UPGRADE_COMPOUND_LIMIT: ItemLevelInfo = {
    "suckerpunch": 1, // Very valuable, don't destroy
    "fury": 3, // Very valuable, don't destroy
    "supermittens": 3, // Very valuable, don't destroy
    "lostearring": 2, // Level 2 is the best for exchanging
    "test_orb": 0, // No advantages for leveling this item
    "throwingstars": 0, // We're going to craft them in to fiery throwing stars
    "vitring": 2, // Level 2 vitrings are useful for crafting
    "vorb": 0, // No advantages for leveling this item
    "tigercape": 7, "bcape": 7 // I need better capes
}

export const REPLENISHABLES_TO_BUY: [ItemName, number][] = [
    ["hpot1", 1000],
    ["mpot1", 1000]
]

export function calculateAttackLoopCooldown(bot: Character): number {
    let cooldown = bot.getCooldown("attack")

    // Use zapper cooldown, if we have one
    if ((bot.hasItem("zapper") || bot.isEquipped("zapper")) && bot.canUse("zapperzap", { ignoreCooldown: true, ignoreEquipped: true })) cooldown = Math.min(cooldown, bot.getCooldown("zapperzap"))

    if (bot.ctype == "mage") {
        if (bot.canUse("cburst", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("cburst"))
        // NOTE: We don't currently use burst in the attack logic, so we're not checking it here
    } else if (bot.ctype == "ranger") {
        if (bot.canUse("supershot", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("supershot"))
        // NOTE: We don't currently use poison arrow in the attack logic, so we're not checking it here
    } else if (bot.ctype == "rogue") {
        if (bot.canUse("quickpunch", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("quickpunch"))
        if (bot.canUse("quickstab", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("quickstab"))
        if (bot.canUse("mentalburst", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("mentalburst"))
    } else if (bot.ctype == "warrior") {
        if (bot.canUse("agitate", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("agitate"))
        if ((bot.hasItem("bataxe") || bot.hasItem("scythe")) && bot.canUse("cleave", { ignoreCooldown: true, ignoreEquipped: true })) cooldown = Math.min(cooldown, bot.getCooldown("cleave"))
        if (bot.canUse("taunt", { ignoreCooldown: true })) cooldown = Math.min(cooldown, bot.getCooldown("taunt"))
        if ((bot.hasItem("basher") || bot.hasItem("wbasher")) && bot.canUse("stomp", { ignoreCooldown: true, ignoreEquipped: true })) cooldown = Math.min(cooldown, bot.getCooldown("stomp"))
    }

    // NOTE: We want the attack loop to be a lot tighter than the normal LOOP_MS, because it's more important
    return Math.max(LOOP_MS / 10, cooldown)
}

export function getFirstEmptyInventorySlot(items: ItemData[]): number {
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) return i
    }
    return undefined
}

export function ensureEquipped(bot: Character, item: ItemName, slot: SlotType): boolean {
    if (bot.slots[slot]?.name != item) {
        const index = bot.locateItem(item)
        if (index !== undefined) {
            bot.equip(index).catch(() => { /* Suppress Errors */ })
            return true
        }
        return false
    }
    return true
}

/**
 * These are cooperative entities that don't spawn very often.
 * We only want to do them when others are attacking them, too.
 *
 * @param bot
 * @returns
 */
export async function getPriority1Entities(bot: Character): Promise<Entity[] | IEntity[]> {
    // NOTE: This list is ordered higher -> lower priority
    const coop: MonsterName[] = [
        // Event-based
        "crabxx", "dragold", "grinch", "mrpumpkin", "mrgreen",
        // Year-round
        "franky", "icegolem"]
    const nearby: Entity[] = []
    for (const entity of bot.getEntities({
        typeList: coop
    })) {
        if (entity.target == undefined) continue
        nearby.push(entity)
    }
    if (nearby.length > 0) return nearby

    const alive: IEntity[] = []
    for (const key in bot.S) {
        const data = bot.S[key as MonsterName] as ServerInfoDataLive
        if (typeof data == "object" && data.live) {
            if (!data.target
                && !["grinch"].includes(key) /** Grinch changes target a lot, keep on him */) continue // No target
            alive.push({
                in: data.map,
                map: data.map,
                serverIdentifier: bot.server.name,
                serverRegion: bot.server.region,
                type: key as MonsterName,
                x: data.x,
                y: data.y,
            })
        }
    }
    return alive
}

/**
 * These are non-cooperative entities that don't spawn very often.
 * @param bot
 * @returns
 */
export async function getPriority2Entities(bot: Character): Promise<Entity[] | IEntity[]> {
    // NOTE: This list is ordered higher -> lower priority
    const solo: MonsterName[] = [
        "goldenbat",
        // Goo Brawl
        "rgoo",
        // Very Rare Monsters
        "tinyp", "cutebee",
        // Event Monsters
        "pinkgoo", "wabbit", "slenderman", "tiger",
        // Rare Monsters
        "snowman", "greenjr", "jr", "skeletor", "mvampire", "fvampire", "stompy",
        // Crypt Monsters
        "vbat", "a2"
    ]
    const nearby = bot.getEntities({
        couldGiveCredit: true,
        typeList: solo
    })
    if (nearby.length > 0) return nearby
    let partyList = [bot.id]
    if (bot.party) partyList = bot.partyData.list

    if (bot.server.name == "PVP") {
        // Don't attack the following monsters on PVP, because kouin will destroy us.
        for (const toAvoid of ["cutebee", "goldenbat", "skeletor", "slenderman"] as MonsterName[]) {
            if (solo.includes(toAvoid)) solo.splice(solo.indexOf(toAvoid), 1)
        }
    }

    return await AL.EntityModel.aggregate([
        {
            $match: {
                $or: [
                    { target: undefined },
                    { target: { $in: partyList } },
                    { type: { $in: ["pinkgoo", "snowman", "wabbit"] } } // Coop monsters will give credit
                ],
                serverIdentifier: bot.server.name,
                serverRegion: bot.server.region,
                type: { $in: solo },
                x: { $ne: undefined },
                y: { $ne: undefined }
            }
        },
        { $addFields: { __order: { $indexOfArray: [solo, "$type"] } } },
        { $sort: { "__order": 1 } },
        { $project: {
            __order: 0,
            _id: 0,
            lastSeen: 0,
            serverIdentifier: 0,
            serverRegion: 0
        } }]).exec()
}

export async function getMonsterHuntTargets(bot: Character, friends: Character[]): Promise<(MonsterName)[]> {
    if (!bot.party) {
        // We have no party, we're doing MHs solo
        if (bot.s.monsterhunt && bot.s.monsterhunt.c > 0) return [bot.s.monsterhunt.id] // We have an active MH
        return [] // We don't have an active MH
    }

    const data: {
        id: MonsterName
        ms: number
    }[] = []

    // Add monster hunts from friends
    const mhIDs = []
    for (const friend of friends) {
        if (!friend) continue
        mhIDs.push(friend.id)

        // Check if they've already completed it
        if (!friend.s.monsterhunt || friend.s.monsterhunt.c == 0) continue

        // Check if it's for a different server
        const [region, id] = friend.s.monsterhunt.sn.split(" ") as [ServerRegion, ServerIdentifier]
        if (bot.serverData.region !== region || bot.serverData.name !== id) continue

        data.push(friend.s.monsterhunt)
    }

    // Add monster hunts from others in our party
    let lookupOthers = false
    for (const partyMemberID of bot.partyData.list) {
        if (!mhIDs.includes(partyMemberID)) {
            const partyMember = bot.players.get(partyMemberID)
            if (partyMember) {
                mhIDs.push(partyMemberID)
                if (!partyMember.s.monsterhunt || partyMember.s.monsterhunt.c == 0) continue
                data.push(partyMember.s.monsterhunt)
            } else {
                lookupOthers = true
            }
        }
    }

    if (lookupOthers) {
        for (const player of await AL.PlayerModel.aggregate([
            {
                $match: {
                    $and: [
                        { lastSeen: { $gt: Date.now() - 60000 } },
                        { name: { $nin: mhIDs } },
                        { name: { $in: bot.partyData.list } },
                        { "s.monsterhunt.c": { $gt: 0 } },
                        { "s.monsterhunt.sn": `${bot.server.region} ${bot.server.name}` },
                        { serverIdentifier: bot.serverData.name },
                        { serverRegion: bot.serverData.region }
                    ]
                }
            }, {
                $addFields: {
                    monster: "$s.monsterhunt.id",
                    timeLeft: { $subtract: ["$s.monsterhunt.ms", { $subtract: [Date.now(), "$lastSeen"] }] }
                }
            }, {
                $match: {
                    timeLeft: { $gt: 0 }
                }
            }, {
                $sort: {
                    timeLeft: 1
                }
            }, {
                $project: {
                    _id: 0,
                    monster: 1,
                    timeLeft: 1
                }
            }]
        ).exec()) {
            data.push({
                id: player.monster,
                ms: player.timeLeft
            })
        }
    }

    data.sort((a, b) => {
        return a.ms - b.ms
    })
    const targets: (MonsterName)[] = []
    for (const datum of data) {
        targets.push(datum.id)
    }

    return targets
}

export async function goGetRspeedBuff(bot: Character, msToWait = 10000): Promise<void> {
    if (bot.s.rspeed) return // We already have it
    if (FRIENDLY_ROGUES.length == 0) return // We don't know any friendly rogues

    const friendlyRogues = await AL.PlayerModel.find({
        lastSeen: { $gt: Date.now() - 120_000 },
        name: { $in: FRIENDLY_ROGUES },
        rip: { $ne: true },
        serverIdentifier: bot.server.name,
        serverRegion: bot.server.region
    }).lean().exec()

    const options: PathfinderOptions = {}
    options.costs = {
        town: bot.speed * (4 + (Math.min(bot.ping, 1000) / 500)), // Set it to 4s of movement, because it takes 3s to channel + it could be cancelled.
        transport: bot.speed * (Math.min(bot.ping, 1000) / 500) // Based on how long it takes to confirm with the server
    }

    let closestDistance: number = Number.MAX_VALUE
    let closest = -1
    for (let i = 0; i < friendlyRogues.length; i++) {
        const location = friendlyRogues[i]
        const potentialPath = await Pathfinder.getPath(bot, location)
        const distance = Pathfinder.computePathCost(potentialPath)
        if (distance < closestDistance) {
            closest = i
            closestDistance = distance
        }
    }
    const friendlyRogue = friendlyRogues[closest]

    if (friendlyRogue) {
        if (bot.ctype == "merchant") (bot as Merchant).closeMerchantStand().catch(console.error)
        await bot.smartMove(friendlyRogue, { getWithin: 20, stopIfTrue: () => bot.s.rspeed !== undefined, useBlink: true }).catch(() => { /* */ })
        if (["earthRog"].includes(friendlyRogue.id)) return // Don't remove earthRog from the list, they're probably just low MP

        // Wait a bit for rspeed
        if (!bot.s.rspeed) {
            const rspeedReceived = new Promise<boolean>((resolve) => {
                const interval = setInterval(() => {
                    if (bot.s.rspeed) {
                        clearInterval(interval)
                        resolve(true)
                    }
                }, 250)
                setTimeout(() => {
                    const index = FRIENDLY_ROGUES.indexOf(friendlyRogue.id)
                    if (!bot.s.rspeed && index !== -1) FRIENDLY_ROGUES.splice(index, 1) // They're not giving rspeed, remove them from our list
                    clearInterval(interval)
                    resolve(false)
                }, msToWait)
            })
            await rspeedReceived
        }
    }
}

export async function goToAggroMonster(bot: Character, entity: Entity): Promise<unknown> {
    if (entity.target) return // It's already aggro'd

    if (entity.going_x !== undefined && entity.going_y !== undefined) {
        const distanceToTravel = AL.Tools.distance({ x: entity.x, y: entity.y }, { x: entity.going_x, y: entity.going_y })
        const lead = 20 + (LOOP_MS / 1000) * entity.speed
        if (distanceToTravel >= lead) {
            const angle = Math.atan2(entity.going_y - entity.y, entity.going_x - entity.x)
            const destination = { map: entity.map, x: entity.x + Math.cos(angle) * lead, y: entity.y + Math.sin(angle) * lead }
            if (AL.Pathfinder.canWalkPath(bot, destination)) {
                bot.move(destination.x, destination.y, { resolveOnStart: true }).catch(() => { /* Suppress errors */ })
            } else {
                return bot.smartMove(destination).catch(() => { /* */ })
            }
        } else {
            const destination: IPosition = { map: entity.map, x: entity.going_x, y: entity.going_y }
            if (AL.Pathfinder.canWalkPath(bot, destination)) {
                bot.move(destination.x, destination.y).catch(() => { /* Suppress errors */ })
            } else {
                return bot.smartMove(destination).catch(() => { /* */ })
            }
        }
    }
}

export async function goToBankIfFull(bot: Character, itemsToHold: Set<ItemName>, goldToHold: number): Promise<void> {
    if (!bot.isFull()) return // We aren't full

    await bot.smartMove("fancypots", { avoidTownWarps: true }) // Move to potion seller to give the sell loop a chance to sell things
    await bot.smartMove(bankingPosition, { avoidTownWarps: true }).catch(() => { /* */ }) // Move to bank teller to give bank time to get ready

    for (let i = 0; i < bot.isize; i++) {
        const item = bot.items[i]
        if (!item) continue // No item in this slot
        if (item.l == "l") continue // Don't send locked items
        if (itemsToHold.has(item.name)) continue

        try {
            await bot.depositItem(i)
        } catch (e) {
            console.error(e)
        }
    }

    if (bot.gold > goldToHold) await bot.depositGold(bot.gold - goldToHold)
}

export function goToKiteMonster(bot: Character, options: {
    kiteDistance?: number
    stayWithinAttackingRange?: boolean
    type?: MonsterName
    typeList?: MonsterName[]
}): void {
    // Find the nearest entity
    let nearest: Entity
    let distance: number = Number.MAX_VALUE
    for (const entity of bot.getEntities(options)) {
        const d = AL.Tools.squaredDistance(bot, entity)
        if (d < distance) {
            distance = d
            nearest = entity
        }
    }

    // If we're not near anything, don't move.
    if (!nearest) return

    // Stop smart moving when we can walk to the monster directly
    if (bot.smartMoving && (AL.Pathfinder.canWalkPath(bot, nearest) || distance < bot.range)) {
        bot.stopSmartMove().catch(() => { /* Suppress errors */ })
    }

    let kiteDistance = nearest.range + nearest.speed
    if (options?.kiteDistance) kiteDistance = options.kiteDistance
    if (options?.stayWithinAttackingRange) kiteDistance = Math.min(bot.range, kiteDistance)

    const distanceToMove = distance - kiteDistance
    const angleFromBotToMonster = Math.atan2(nearest.y - bot.y, nearest.x - bot.x)
    let potentialSpot: IPosition = { map: bot.map, x: bot.x + distanceToMove * Math.cos(angleFromBotToMonster), y: bot.y + distanceToMove * Math.sin(angleFromBotToMonster) }
    let angle = 0
    while (!AL.Pathfinder.canStand(potentialSpot) && angle <= 2 * Math.PI) {
        if (angle > 0) {
            angle = -angle
        } else {
            angle -= Math.PI / 180 // Increase angle by 1 degree
            angle = -angle
        }
        potentialSpot = { map: bot.map, x: bot.x + distanceToMove * Math.cos(angleFromBotToMonster + angle), y: bot.y + distanceToMove * Math.sin(angleFromBotToMonster + angle) }
    }
    if (AL.Pathfinder.canWalkPath(bot, potentialSpot)) {
        bot.move(potentialSpot.x, potentialSpot.y, { resolveOnStart: true }).catch(() => { /* Suppress errors */ })
    } else if (AL.Pathfinder.canStand(potentialSpot) && !bot.smartMoving) {
        bot.smartMove(potentialSpot, { avoidTownWarps: true }).catch(() => { /* */ })
    }
}

export type KiteOptions = {
    kiteMonsters?: boolean
    kitePlayers?: boolean
    numWallChecks?: number
    type?: MonsterName
    typeList?: MonsterName[]
    weighting?: {
        [T in number]?: number
    }
}
export function goToKiteStuff(bot: Character, options?: KiteOptions): void {
    // Set default options
    if (options == undefined) options = {}
    if (options.kitePlayers == undefined) options.kitePlayers = bot.isPVP()
    if (options.kiteMonsters == undefined) options.kiteMonsters = true
    if (!options.numWallChecks) options.numWallChecks = 16
    if (!options.weighting) options.weighting = { 200: 25, 100: 25, 50: 25, 25: 25, 10: 25, 1: 25 }

    // Send out feelers for walls
    const vector = { x: 0, y: 0 }
    for (const weightString in options.weighting) {
        const checkDistance = Number.parseInt(weightString)
        const checkWeight = options.weighting[checkDistance]

        let angleFromBotToWall = 0
        for (let i = 0; i < options.numWallChecks; i++) {
            const x = Math.cos(angleFromBotToWall) * checkDistance
            const y = Math.sin(angleFromBotToWall) * checkDistance
            const canWalk = AL.Pathfinder.canWalkPath(bot, { in: bot.in, map: bot.map, x: bot.x + x, y: bot.y + y })
            if (!canWalk) {
                vector.x -= Math.cos(angleFromBotToWall) * checkWeight
                vector.y -= Math.sin(angleFromBotToWall) * checkWeight
            }
            angleFromBotToWall += (2 * Math.PI) / options.numWallChecks
        }
    }

    // Stay away from other players
    if (options.kitePlayers) {
        for (const [, player] of bot.players) {
            if (player.isFriendly(bot)) continue // We are friends, yay!
            const distanceToPlayer = AL.Tools.distance(bot, player)
            let idealDistance: number
            if (bot.range > player.range) {
                // We out-range them
                idealDistance = Math.min(bot.range, player.range + player.speed)
            } else {
                // They out-range us
                if (player.speed > bot.speed) {
                    // They out-run us
                    idealDistance = bot.range - player.speed
                } else {
                    idealDistance = bot.range - bot.speed
                }
            }

            const angleFromBotToPlayer = Math.atan2(player.y - bot.y, player.x - bot.x)
            vector.x += Math.cos(angleFromBotToPlayer) * (distanceToPlayer - idealDistance)
            vector.y += Math.sin(angleFromBotToPlayer) * (distanceToPlayer - idealDistance)
        }
    }

    // Stay away from monsters
    if (options.kiteMonsters) {
        for (const monster of bot.getEntities(options)) {
            const distanceToMonster = AL.Tools.distance(bot, monster)
            let idealDistance: number
            if (bot.range > monster.range) {
                // We out-range them
                if (bot.speed > monster.charge) {
                    // We out-run them
                    idealDistance = Math.min(bot.range, monster.range + monster.charge)
                } else {
                    idealDistance = bot.range
                }
            } else {
                // They out-range us
                if (monster.speed > bot.speed) {
                    // They out-run us
                    idealDistance = bot.range - monster.charge
                } else {
                    idealDistance = bot.range - bot.speed
                }
            }

            const angleFromBotToMonster = Math.atan2(monster.y - bot.y, monster.x - bot.x)
            vector.x += Math.cos(angleFromBotToMonster) * (distanceToMonster - idealDistance)
            vector.y += Math.sin(angleFromBotToMonster) * (distanceToMonster - idealDistance)
        }
    }

    bot.move(bot.x + vector.x, bot.y + vector.y, { resolveOnStart: true }).catch(console.error)
}

export async function goToNPC(bot: Character, name: NPCName) {
    const fixedName = bot.G.npcs[name].name

    // Look for it in our visible entities
    const npc = bot.players.get(fixedName)
    if (npc) return bot.smartMove(offsetPositionParty(npc, bot), { useBlink: true }).catch(() => { /* */ })

    // Look for it in our database
    const special = await AL.NPCModel.findOne({ name: fixedName, serverIdentifier: bot.server.name, serverRegion: bot.server.region }).lean().exec()
    if (special) return bot.smartMove(offsetPositionParty(special, bot), { useBlink: true }).catch(() => { /* */ })
}

export async function goToPriestIfHurt(bot: Character, priest: Character): Promise<IPosition> {
    if (bot.hp > bot.max_hp / 2) return // We still have over half our HP
    if (!priest) return // Priest is not available

    return bot.smartMove(priest, { getWithin: priest.range, stopIfTrue: () => bot.hp >= bot.max_hp * 0.6 })
}

export async function goToSpecialMonster(bot: Character, type: MonsterName, options: { requestMagiport?: true} = {}): Promise<unknown> {
    const stopIfTrue = (): boolean => {
        const target = bot.getEntity({ type: type })
        if (!target) return false // No target, don't stop
        if (Pathfinder.canWalkPath(bot, target)) return true // We can walk to it, stop!
    }

    // Look for it nearby
    let target = bot.getEntity({ returnNearest: true, type: type })
    if (target) {
        await bot.smartMove(target, { getWithin: bot.range - 10, stopIfTrue: stopIfTrue, useBlink: true }).catch(() => { /* */ })
        return bot.smartMove(target, { getWithin: bot.range - 10, useBlink: true }).catch(() => { /* */ })
    }

    // Look for it in the server data
    if ((bot.S?.[type] as ServerInfoDataLive)?.live && bot.S[type]["x"] !== undefined && bot.S[type]["y"] !== undefined) {
        const destination = bot.S[type] as IPosition
        if (options.requestMagiport) requestMagiportService(bot, destination)
        if (AL.Tools.distance(bot, destination) > bot.range) return bot.smartMove(destination, { getWithin: bot.range - 10, stopIfTrue: stopIfTrue, useBlink: true }).catch(() => { /* */ })
    }

    // Look for it in our database
    const dbTarget = await AL.EntityModel.findOne({ serverIdentifier: bot.server.name, serverRegion: bot.server.region, type: type }).lean().exec()
    if (dbTarget && dbTarget.x !== undefined && dbTarget.y !== undefined) {
        if (options.requestMagiport) requestMagiportService(bot, dbTarget)
        return bot.smartMove(dbTarget, { getWithin: bot.range - 10, stopIfTrue: stopIfTrue, useBlink: true }).catch(() => { /* */ })
    }

    // Look for if there's a spawn for it
    for (const spawn of Pathfinder.locateMonster(type)) {
        // Move to the next spawn
        await bot.smartMove(spawn, { getWithin: bot.range - 10, stopIfTrue: () => bot.getEntity({ type: type }) !== undefined }).catch(() => { /* */ })

        target = bot.getEntity({ returnNearest: true, type: type })
        if (target) return bot.smartMove(target, { getWithin: bot.range - 10, stopIfTrue: stopIfTrue, useBlink: true }).catch(() => { /* */ })
    }

    // Go through all the spawns on the map to look for it
    if ((dbTarget && dbTarget.x == undefined && dbTarget.y == undefined && dbTarget.map)
        || ((bot.S?.[type] as ServerInfoDataLive)?.live && bot.S[type]["x"] !== undefined && bot.S[type]["y"] !== undefined)) {
        const spawns: IPosition[] = []

        const gMap = bot.G.maps[(dbTarget.map ?? bot.S[type]["map"]) as MapName] as GMap
        if (gMap.ignore) return
        if (gMap.instance || !gMap.monsters || gMap.monsters.length == 0) return // Map is unreachable, or there are no monsters

        for (const spawn of gMap.monsters) {
            const gMonster = bot.G.monsters[spawn.type]
            if (gMonster.aggro >= 100 || gMonster.rage >= 100) continue // Skip aggro spawns
            if (spawn.boundary) {
                spawns.push({ "map": dbTarget.map, "x": (spawn.boundary[0] + spawn.boundary[2]) / 2, "y": (spawn.boundary[1] + spawn.boundary[3]) / 2 })
            } else if (spawn.boundaries) {
                for (const boundary of spawn.boundaries) {
                    spawns.push({ "map": boundary[0], "x": (boundary[1] + boundary[3]) / 2, "y": (boundary[2] + boundary[4]) / 2 })
                }
            }
        }

        // Sort to improve efficiency a little
        spawns.sort((a, b) => a.x - b.x)

        for (const spawn of spawns) {
            // Move to the next spawn
            await bot.smartMove(spawn, { getWithin: bot.range - 10, stopIfTrue: () => bot.getEntity({ type: type }) !== undefined }).catch(() => { /* */ })

            target = bot.getEntity({ returnNearest: true, type: type })
            if (target) return bot.smartMove(target, { getWithin: bot.range - 10, stopIfTrue: stopIfTrue, useBlink: true }).catch(() => { /* */ })
        }
    }
}

/**
 * Go to the potion seller NPC if we're low on potions so we can buy some
 *
 * NOTE: If you don't startBuyLoop() with a potion amount higher than minHpPots and minMpPots, we might get stuck!
 * NOTE: If you don't have enough gold, we might get stuck!
 * @param bot
 * @param minHpPots
 * @param minMpPots
 * @returns
 */
export async function goToPotionSellerIfLow(bot: Character, minHpPots = 100, minMpPots = 100): Promise<void> {
    if (bot.hasItem("computer")) return // Don't need to move if we have a computer

    const currentHpPots = bot.countItem("hpot1")
    const currentMpPots = bot.countItem("mpot1")

    if (currentHpPots >= minHpPots && currentMpPots >= minMpPots) return // We don't need any more.

    // We're under the minimum, go buy potions
    await bot.smartMove("fancypots", { getWithin: AL.Constants.NPC_INTERACTION_DISTANCE / 2 }).catch(() => { /* */ })
    await sleep(1000)
}

/**
 * Go near an NPC so we can sell our unwanted items.
 *
 * NOTE: If you don't startSellItemLoop(), we might get stuck!
 * @param bot
 * @param itemsToSell
 * @returns
 */
export async function goToNPCShopIfFull(bot: Character, itemsToSell = ITEMS_TO_SELL): Promise<void> {
    if (!bot.isFull()) return // Not full
    if (bot.hasItem("computer") || bot.hasItem("supercomputer")) return // We don't need to move if we have a computer

    let hasSellableItem = false
    for (const item of bot.items) {
        if (!item) continue
        if ((item.level ?? 0) <= itemsToSell[item.name]) {
            // We have something we could sell to make room
            hasSellableItem = true
            break
        }
    }
    if (!hasSellableItem) return // We don't have anything to sell

    await bot.smartMove("fancypots", { getWithin: AL.Constants.NPC_INTERACTION_DISTANCE / 2 }).catch(() => { /* */ })
    await sleep(1000)
}

export async function goToNearestWalkableToMonster(bot: Character, types: MonsterName[], defaultPosition?: IPosition, getWithin = bot.range): Promise<unknown> {
    const nearest = bot.getEntity({
        canWalkTo: true,
        couldGiveCredit: true,
        returnNearest: true,
        typeList: types,
        willBurnToDeath: false,
        willDieToProjectiles: false
    })

    if (nearest && Tools.distance(bot, nearest) > getWithin) {
        const destination = offsetPositionParty(nearest, bot)
        bot.move(destination.x, destination.y, { resolveOnStart: true }).catch(() => { /* Suppress errors */ })
    } else if (!nearest && defaultPosition) {
        const destination = offsetPositionParty(defaultPosition, bot)
        if (AL.Pathfinder.canWalkPath(bot, destination)) {
            bot.move(destination.x, destination.y, { resolveOnStart: true }).catch(() => { /* Suppress errors */ })
        } else {
            return bot.smartMove(destination, { stopIfTrue: () => bot.getEntity({ canWalkTo: true, typeList: types }) !== undefined, useBlink: true }).catch(() => { /* */ })
        }
    } else if (!nearest) {
        return bot.smartMove(types[0], { stopIfTrue: () => bot.getEntity({ canWalkTo: true, typeList: types }) !== undefined, useBlink: true }).catch(() => { /* */ })
    }
}

export function goToNearestWalkableToMonster2(bot: Character, types: MonsterName[], defaultPosition?: IPosition): void {
    const targets = bot.getEntities({ canDamage: true, canWalkTo: true, couldGiveCredit: true, typeList: types, willBurnToDeath: false, willDieToProjectiles: false })
    targets.sort(sortClosestDistance(bot))

    const costs = {
        enter: 9999,
        town: 9999,
        transport: 9999
    }

    let lastD: number
    for (const target of targets) {
        const d = AL.Tools.distance({ x: bot.x, y: bot.y }, { x: target.x, y: target.y })
        if (d <= bot.range) {
            lastD = d
            continue
        }

        if (lastD !== undefined) {
            // We're in range of one or more monsters, move as much as we can to the next monster without going outside of the attack range of all existing monsters
            bot.smartMove(target, { avoidTownWarps: true, costs: costs, getWithin: d - (bot.range - lastD), resolveOnFinalMoveStart: true }).catch(() => { /* */ })
        } else {
            // We're out of range of all monsters
            bot.smartMove(target, { avoidTownWarps: true, costs: costs, resolveOnFinalMoveStart: true }).catch(() => { /* */ })
        }
        return
    }

    if (lastD) {
        if (defaultPosition) {
            // Move towards center of default position
            bot.smartMove(offsetPositionParty(defaultPosition, bot), { avoidTownWarps: true, costs: costs, getWithin: Tools.distance(bot, defaultPosition) - (bot.range - lastD), resolveOnFinalMoveStart: true }).catch(() => { /* */ })
        } else if (types) {
            // Move towards center of closest spawn
            const locations: IPosition[] = []
            for (const type of types ?? []) {
                locations.push(...Pathfinder.locateMonster(type))
            }
            locations.sort(sortClosestDistance(bot))
            bot.smartMove(offsetPositionParty(locations[0], bot), { avoidTownWarps: true, costs: costs, getWithin: Tools.distance(bot, locations[0]) - (bot.range - lastD), resolveOnFinalMoveStart: true }).catch(() => { /* */ })
        }
    } else if (!bot.smartMoving) {
        // No targets nearby, move to spawn
        if (defaultPosition) {
            bot.smartMove(offsetPositionParty(defaultPosition, bot), { resolveOnFinalMoveStart: true, useBlink: true }).catch(() => { /* */ })
        } else if (types) {
            const locations: IPosition[] = []
            for (const type of types) {
                locations.push(...Pathfinder.locateMonster(type))
            }
            locations.sort(sortClosestDistance(bot))
            bot.smartMove(offsetPositionParty(locations[0], bot), { resolveOnFinalMoveStart: true, useBlink: true }).catch(() => { /* */ })
        }
    }
}

export function kiteInCircle(bot: Character, type: MonsterName, center: IPosition, radius = 100, angle = Math.PI / 2.5): Promise<IPosition> {
    if (AL.Pathfinder.canWalkPath(bot, center)) {
        const nearest = bot.getEntity({ returnNearest: true, type: type })
        if (nearest) {
            // There's a monster nearby
            const angleFromCenterToMonsterGoing = Math.atan2(nearest.going_y - center.y, nearest.going_x - center.x)
            const endGoalAngle = angleFromCenterToMonsterGoing + angle
            const endGoal = offsetPositionParty({ x: center.x + radius * Math.cos(endGoalAngle), y: center.y + radius * Math.sin(endGoalAngle) }, bot)
            bot.move(endGoal.x, endGoal.y, { resolveOnStart: true }).catch(console.error)
        } else {
            // There isn't a monster nearby
            const angleFromSpawnToBot = Math.atan2(bot.y - center.y, bot.x - center.x)
            const endGoal = offsetPositionParty({ x: center.x + radius * Math.cos(angleFromSpawnToBot), y: center.y + radius * Math.sin(angleFromSpawnToBot) }, bot)
            return bot.move(endGoal.x, endGoal.y, { resolveOnStart: true })
        }
    } else {
        // Move to where we can walk
        return bot.smartMove(center, { getWithin: radius })
    }
}

export async function moveInCircle(bot: Character, center: IPosition, radius = 125, angle = Math.PI / 2.5): Promise<IPosition> {
    if (AL.Pathfinder.canWalkPath(bot, center)) {
        const angleFromCenterToCurrent = Math.atan2(bot.y - center.y, bot.x - center.x)
        const endGoalAngle = angleFromCenterToCurrent + angle
        const endGoal = { x: center.x + radius * Math.cos(endGoalAngle), y: center.y + radius * Math.sin(endGoalAngle) }
        bot.move(endGoal.x, endGoal.y, { resolveOnStart: true }).catch(() => { /** Suppress errors */ })
    } else {
        // Move to where we can walk
        return bot.smartMove(center, { getWithin: radius })
    }
}

export function requestMagiportService(bot: Character, targetLocation: IPosition, within = 300): void {
    // If we're already close, don't request anything
    if (Tools.distance(bot, targetLocation) < within) return

    // Get player locations
    let numRequested = 0
    AL.PlayerModel.find({
        lastSeen: { $gt: Date.now() - 30000 },
        map: targetLocation.map,
        name: { $in: [
            "Bjarny", "Clarity", // Public magiport services
            "lolwutpear", "shoopdawhoop", "ytmnd", // lolwutpear's mages
            "facilitating", "gratuitously", "hypothesized"] // sesquipedalian's mages
        },
        serverIdentifier: bot.server.name,
        serverRegion: bot.server.region }, {
        _id: 0, map: 1, name: 1, x: 1, y: 1
    }).lean().exec().then((players) => {
        for (const player of players) {
            if (AL.Tools.distance(targetLocation, player) > within) continue // They're too far away from the target

            if (["Bjarny", "lolwutpear", "shoopdawhoop", "ytmnd", "facilitating", "gratuitously", "hypothesized"].includes(player.name)) bot.sendCM([player.name], "magiport").catch(console.error)
            else if (player.name == "Clarity") bot.sendCM([player.name], "magiport_please_dad").catch(console.error)

            // Don't request too many because of call code cost
            if (numRequested++ > 3) break
        }
    }).catch(console.error)
}

const lastCheck = new Map<string, number>()
export function checkOnlyEveryMS(key: string, msSince = 5000) {
    const last = lastCheck.get(key)
    if (!last || last < Date.now() - msSince) {
        lastCheck.set(key, Date.now())
        return true
    }
    return false
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function startAvoidStacking(bot: Character): void {
    bot.socket.on("hit", async (data: HitData) => {
        if (data.id !== bot.id) return // Not for us
        if (!data.stacked) return
        if (!data.stacked.includes(bot.id)) return // We're not the ones that are stacked

        console.info(`Moving ${bot.id} to avoid stacking!`)

        const x = -25 + Math.round(50 * Math.random())
        const y = -25 + Math.round(50 * Math.random())
        await bot.move(bot.x + x, bot.y + y).catch(() => { /* Suppress errors */ })
    })
}

export function startBuyReplenishablesLoop(bot: Character, replenishablesToBuy = REPLENISHABLES_TO_BUY): void {
    async function buyReplenishablesLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            for (const [item, amount] of replenishablesToBuy) {
                if (bot.canBuy(item)) {
                    const num = bot.countItem(item)
                    const numToBuy = Math.min(amount - num, Math.floor(bot.gold / AL.Game.G.items[item].g))
                    if (numToBuy > 0) await bot.buy(item, numToBuy)
                }
            }
        } catch (e) {
            console.error(`[${bot.ctype}]: ${e}`)
        }
        bot.timeouts.set("buyReplenishablesLoop", setTimeout(buyReplenishablesLoop, LOOP_MS))
    }
    buyReplenishablesLoop().catch(e => console.error(`[${bot.ctype}]: ${e}`))
}

export function startBuyLoop(bot: Character, itemsToBuy: Set<ItemName>, replenishablesToBuy = REPLENISHABLES_TO_BUY): void {
    const pontyLocations = Pathfinder.locateNPC("secondhands")
    let lastPonty = 0
    async function buyLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            for (const [item, amount] of replenishablesToBuy) {
                if (bot.canBuy(item)) {
                    const num = bot.countItem(item)
                    const numToBuy = Math.min(amount - num, Math.floor(bot.gold / AL.Game.G.items[item].g))
                    if (numToBuy > 0) await bot.buy(item, numToBuy)
                }
            }

            // Buy things from Ponty
            if (Date.now() > lastPonty + CHECK_PONTY_EVERY_MS) {
                for (const ponty of pontyLocations) {
                    if (AL.Tools.distance(bot, ponty) > AL.Constants.NPC_INTERACTION_DISTANCE) continue
                    lastPonty = Date.now()
                    const pontyItems = await bot.getPontyItems()
                    for (const item of pontyItems) {
                        if (!item) continue

                        if (
                            item.p // Buy all shiny/glitched/etc. items
                            || itemsToBuy.has(item.name) // Buy anything in our buy list
                        ) {
                            await bot.buyFromPonty(item)
                            continue
                        }
                    }
                    break
                }
            }

            // Buy things from other merchants
            for (const [, player] of bot.players) {
                // if (!player.stand) continue // Not selling anything
                if (AL.Tools.distance(bot, player) > AL.Constants.NPC_INTERACTION_DISTANCE) continue // Too far away

                for (const s in player.slots) {
                    const slot = s as TradeSlotType
                    const item = player.slots[slot]
                    if (!item) continue // Nothing in the slot
                    if (!item.rid) continue // Not a trade item
                    if (item.b) continue // They are buying, not selling

                    let buyableFromNPC = false
                    for (const map in bot.G.maps) {
                        if (buyableFromNPC == true) break
                        if (bot.G.maps[map as MapName].ignore) continue
                        for (const npc of (bot.G.maps[map as MapName] as GMap).npcs) {
                            if (buyableFromNPC == true) break
                            if (bot.G.npcs[npc.id].items == undefined) continue
                            buyableFromNPC = bot.G.npcs[npc.id].items.includes(item.name)
                        }
                    }

                    const q = item.q === undefined ? 1 : item.q

                    // Join new giveaways if we're a merchant
                    if (item.giveaway && bot.ctype == "merchant" && !["attackMer"].includes(player.id) && (!item.list || !item.list.includes(bot.id))) {
                        await (bot as Merchant).joinGiveaway(slot, player.id, item.rid)
                        continue
                    }

                    // Buy if we can resell to NPC for more money
                    const cost = bot.calculateItemCost(item)
                    if (bot.gold >= item.price &&
                        ((item.price < cost * 0.6) // Item is lower price than G, which means we could sell it to an NPC straight away and make a profit...
                        || (itemsToBuy.has(item.name) && !buyableFromNPC && item.price <= cost * AL.Constants.PONTY_MARKUP)) // Item is the same, or lower price than Ponty would sell it for, and we want it.
                    ) {
                        await bot.buyFromMerchant(player.id, slot, item.rid, q)
                        continue
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("buyLoop", setTimeout(buyLoop, LOOP_MS))
    }
    buyLoop()
}

export function startBuyFriendsReplenishablesLoop(bot: Character, friends: Character[], replenishablesToBuy = REPLENISHABLES_TO_BUY): void {
    async function buyFriendsReplenishablesLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.hasItem("computer")) return // We can't buy potions anywhere, don't run this loop

            for (let i = 0; i < friends.length; i++) {
                const friend = friends[i]
                if (!friend) continue

                if (bot.esize == 0) break // We are full
                if (friend.hasItem("computer")) continue // They can buy their own potions.
                if (AL.Tools.distance(bot, friend) > AL.Constants.NPC_INTERACTION_DISTANCE) continue // Friend is too far away

                for (const replenishableToBuy of replenishablesToBuy) {
                    const item = replenishableToBuy[0]
                    const holdThisMany = replenishableToBuy[1]
                    const numOnFriend = friend.countItem(item)
                    if (numOnFriend >= holdThisMany) continue // They have enough already
                    if (numOnFriend == 0 && friend.esize == 0) continue // They don't have any space for this item
                    const numOnUs = bot.countItem(item)
                    const sendThisMany = holdThisMany - numOnFriend
                    const buyThisMany = sendThisMany + holdThisMany - numOnUs

                    if (sendThisMany > 0) {
                        let itemPos: number
                        if (buyThisMany > 0) itemPos = (await bot.buy(item, buyThisMany)) as number
                        else itemPos = bot.locateItem(item, bot.items, { quantityGreaterThan: sendThisMany - 1 })
                        await bot.sendItem(friend.id, itemPos, sendThisMany)
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("buyFriendsReplenishablesLoop", setTimeout(buyFriendsReplenishablesLoop, LOOP_MS))
    }
    buyFriendsReplenishablesLoop()
}

export function startBuyToUpgradeLoop(bot: Character, item: ItemName, quantity: number): void {
    async function buyToUpgradeLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            for (let i = bot.countItem(item); i < quantity && bot.esize > 2; i++) {
                if (bot.canBuy(item)) await bot.buy(item)
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("upgradeLoop", setTimeout(buyToUpgradeLoop, LOOP_MS))
    }
    buyToUpgradeLoop()
}

export function startCompoundLoop(bot: Character, itemsToSell: ItemLevelInfo = ITEMS_TO_SELL, itemsToCompound: Set<ItemName> = undefined): void {
    async function compoundLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.q.compound) {
                // We are compounding, we have to wait
                bot.timeouts.set("compoundLoop", setTimeout(compoundLoop, bot.q.compound.ms))
                return
            }
            if (bot.map.startsWith("bank")) {
                // We are in the bank, we have to wait
                bot.timeouts.set("compoundLoop", setTimeout(compoundLoop, LOOP_MS))
                return
            }

            const itemsByLevel = bot.locateItemsByLevel(bot.items, { excludeLockedItems: true })
            for (const dName in itemsByLevel) {
                const itemName = dName as ItemName
                const gInfo = bot.G.items[itemName]
                if (gInfo.compound == undefined) continue // Not compoundable
                if (itemsToCompound !== undefined && !itemsToCompound.has(itemName)) continue // We don't want to compound this
                const level0Grade = gInfo.grades.lastIndexOf(0) + 1
                let foundOne = false
                for (let dLevel = 7; dLevel >= 0; dLevel--) {
                    const items = itemsByLevel[itemName][dLevel]
                    if (items == undefined) continue // No items of this type at this level
                    if (dLevel == UPGRADE_COMPOUND_LIMIT[itemName]) continue // We don't want to compound certain items too much. However, if it's already over that level, compound it.

                    const grade = await bot.calculateItemGrade({ level: dLevel, name: itemName })
                    const cscrollName = `cscroll${grade}` as ItemName

                    if (dLevel >= 4 - level0Grade) {
                        // We don't want to compound high level items automatically
                        if (!foundOne) foundOne = true
                    } else {
                        if (items.length < 3) {
                            foundOne = true
                            continue // Not enough to compound
                        }
                        for (let i = 0; i < items.length; i++) {
                            if (!foundOne) {
                                foundOne = true
                                continue
                            }
                            if (dLevel <= itemsToSell[itemName]) continue // We don't want to compound items we want to sell

                            let cscrollPos = bot.locateItem(cscrollName)
                            const primlingPos = bot.locateItem("offeringp")
                            try {
                                if (cscrollPos == undefined && !bot.canBuy(cscrollName)) continue // We can't buy a scroll for whatever reason :(
                                else if (cscrollPos == undefined) cscrollPos = (await bot.buy(cscrollName)) as number

                                if ((ITEMS_TO_PRIMLING[itemName] && dLevel >= ITEMS_TO_PRIMLING[itemName])
                                    || (!ITEMS_TO_PRIMLING[itemName] && ((level0Grade == 0 && dLevel >= 3) || (level0Grade == 1 && dLevel >= 2) || (level0Grade == 2 && dLevel >= 1)))) {
                                    // We want to use an offeringp to upgrade these
                                    if (primlingPos == undefined) continue // We don't have any offeringps
                                    if (!bot.s.massproduction && bot.canUse("massproduction")) (bot as Merchant).massProduction()
                                    await bot.compound(items[0], items[1], items[2], cscrollPos, primlingPos)
                                } else {
                                    // We don't want to use an offeringp to upgrade these
                                    if (!bot.s.massproduction && bot.canUse("massproduction")) (bot as Merchant).massProduction()
                                    await bot.compound(items[0], items[1], items[2], cscrollPos)
                                }
                                i += 2
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("compoundLoop", setTimeout(compoundLoop, LOOP_MS))
    }
    compoundLoop()
}

export function startCraftLoop(bot: Character, itemsToCraft: Set<ItemName>): void {
    async function craftLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            for (const iName of itemsToCraft) {
                // TODO: New check that checks if we require more space for what we craft,
                //       or if it uses the same slots. If it does, we don't have to worry
                //       about filling up our inventory.
                if (bot.esize < 5) break // Not a lot of empty space
                let craftable = true
                const buysNeeded: [ItemName, number][] = []
                for (const [requiredQuantity, requiredItem, requiredLevel] of bot.G.craft[iName].items) {
                    let fixedLevel = requiredLevel
                    if (requiredLevel === undefined) {
                        if (bot.G.items[requiredItem].upgrade || bot.G.items[requiredItem].compound) fixedLevel = 0
                    }
                    if (bot.hasItem(requiredItem, bot.items, { level: fixedLevel, quantityGreaterThan: requiredQuantity - 1 })) continue
                    if (bot.canBuy(requiredItem, { ignoreLocation: true, quantity: requiredQuantity })) {
                        buysNeeded.push([requiredItem, requiredQuantity])
                        continue
                    }
                    craftable = false
                }
                if (craftable) {
                    for (const [item, num] of buysNeeded) {
                        if (bot.canBuy(item, { quantity: num })) {
                            await bot.buy(item, num)
                            continue
                        }
                        craftable = false
                        break
                    }
                }
                if (craftable && bot.canCraft(iName)) {
                    await bot.craft(iName)
                }
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("craftLoop", setTimeout(craftLoop, 1000))
    }
    craftLoop()
}

const DEBUG_EVENTS_ALL = new Map<string, { incoming: [Date, string, string, boolean][], outgoing: [Date, string, string, boolean][] }>()
export function startDebugLoop(bot: Character, write = false, maxSize = 1000): void {

    const DEBUG_EVENTS: { incoming: [Date, string, string, boolean][], outgoing: [Date, string, string, boolean][] } = { incoming: [], outgoing: [] }
    DEBUG_EVENTS_ALL.set(bot.id, DEBUG_EVENTS)

    let inc = 0
    let out = 0
    bot.socket.onAny((event: string, data: unknown) => {
        DEBUG_EVENTS.incoming[inc] = [new Date(), event, JSON.stringify(data, undefined, 4), true]
        inc = (inc + 1) % maxSize
    })

    bot.socket.onAnyOutgoing((event: string, data: unknown) => {
        DEBUG_EVENTS.outgoing[out] = [new Date(), event, JSON.stringify(data, undefined, 4), false]
        out = (out + 1) % maxSize
    })

    const debugFile = `debug_${bot.id}.csv`

    async function debugLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            // NOTE: Order these in the same order as below
            const data = []
            data.push(Date.now())
            const memory = process.memoryUsage()
            data.push(memory.rss / 1024 / 1024)
            data.push(memory.heapUsed / 1024 / 1024)
            data.push(bot.entities.size)
            data.push(bot.players.size)
            data.push(bot.chests.size)
            data.push(AL.Database.nextUpdate.size)
            data.push(bot.projectiles.size)
            let numListeners = 0
            const listeners = new Map<string, number>()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const name in (bot.socket as any)._callbacks) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const event: any[] = (bot.socket as any)._callbacks[name]
                listeners.set(name, event.length)
                numListeners += event.length
            }
            data.push(numListeners)
            data.push(bot.socket.listenersAny().length)
            data.push(JSON.stringify(Object.fromEntries(listeners)))
            fs.appendFileSync(debugFile, `${data.join(",")}\n`)
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("debugLoop", setTimeout(debugLoop, 600000))
    }

    if (write) {
        // NOTE: Order these in the same order as above
        const headers = []
        headers.push("timestamp")
        headers.push("resident set memory (MB)")
        headers.push("heap memory (MB)")
        headers.push("# entities")
        headers.push("# players")
        headers.push("# chests")
        headers.push("# Database next updates")
        headers.push("# projectiles")
        headers.push("# socket listeners")
        headers.push("# any-socket listeners")
        headers.push("socket listener counts")
        fs.appendFileSync(debugFile, `${headers.join(",")}\n`)
        debugLoop().catch(() => { /* */ })
    }
}

export function writeLast1000Events(bot: Character, filename: string, extra?: string) {
    const eventsObj = DEBUG_EVENTS_ALL.get(bot.id)
    if (!eventsObj) {
        console.debug("You didn't startDebugLoop(), you silly goose!!")
        return
    }
    console.debug(`WRITING LAST 1000 EVENTS TO ${filename}!`)

    const events = [...eventsObj.incoming, ...eventsObj.outgoing]

    try {
        let prepare = extra ? `${extra}\n\n` : ""
        events.sort((a, b) => { return a?.[0].getTime() - b?.[0].getTime() })
        for (const [date, event, data, incoming] of events) {
            if (![`${extra}\n\n`, ""].includes(prepare)) prepare += ",\n"
            prepare += `"${incoming ? "inc=> " : "<=out "}${date.toISOString()}": { "${event}": ${data} }`
        }
        fs.writeFileSync(filename, prepare)
    } catch (e) {
        console.error(e)
        console.error(events)
        fs.writeFileSync(filename, `${e}`)
    }
}

export function startElixirLoop(bot: Character, elixir: ItemName): void {
    async function elixirLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.slots.elixir) {
                let drinkThis = bot.locateItem(elixir)
                if (drinkThis == undefined && bot.canBuy(elixir)) drinkThis = (await bot.buy(elixir)) as number
                if (drinkThis !== undefined) await bot.equip(drinkThis)
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("elixirLoop", setTimeout(elixirLoop, 1000))
    }
    elixirLoop()
}

export function startExchangeLoop(bot: Character, itemsToExchange): void {
    async function exchangeLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.q.exchange) {
                // We are exchanging, we have to wait
                bot.timeouts.set("exchangeLoop", setTimeout(exchangeLoop, bot.q.exchange.ms))
                return
            }

            if (bot.esize >= 5 /** Only exchange if we have plenty of space */
                && !(bot.G.maps[bot.map] as GMap).mount /** Don't exchange in the bank */) {
                for (let i = 0; i < bot.items.length; i++) {
                    const item = bot.items[i]
                    if (!item) continue
                    if (!itemsToExchange.has(item.name)) continue // Don't want / can't exchange
                    if (!bot.canExchange(item.name)) continue // Can't exchange.

                    await bot.exchange(i)
                }
            }

            // Exchange level 2 lostearrings
            if (!(bot.G.maps[bot.map] as GMap).mount /** Don't exchange in the bank */
                && bot.canExchange("lostearring")) {
                for (let i = 0; i < bot.items.length; i++) {
                    const item = bot.items[i]
                    if (!item) continue
                    if (item.name !== "lostearring" || item.level !== 2) continue // Not a level 2 lost earring

                    await bot.exchange(i)
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("exchangeLoop", setTimeout(exchangeLoop, LOOP_MS))
    }
    exchangeLoop()
}

export function startHealLoop(bot: Character): void {
    async function healLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.rip) {
                const missingHP = bot.max_hp - bot.hp
                const missingMP = bot.max_mp - bot.mp
                const hpRatio = bot.hp / bot.max_hp
                const mpRatio = bot.mp / bot.max_mp
                const hpot1 = bot.locateItem("hpot1")
                const hpot0 = bot.locateItem("hpot0")
                const mpot1 = bot.locateItem("mpot1")
                const mpot0 = bot.locateItem("mpot0")
                if (hpRatio < mpRatio) {
                    if (bot.c.town || bot.c.fishing || bot.c.mining) {
                        await bot.regenHP()
                    } else if (missingHP >= 400 && hpot1 !== undefined) {
                        await bot.useHPPot(hpot1)
                    } else if (missingHP >= 200 && hpot0 !== undefined) {
                        await bot.useHPPot(hpot0)
                    } else {
                        await bot.regenHP()
                    }
                } else if (mpRatio < hpRatio) {
                    if (bot.c.town || bot.c.fishing || bot.c.mining) {
                        await bot.regenMP()
                    } else if (missingMP >= 500 && mpot1 !== undefined) {
                        await bot.useMPPot(mpot1)
                    } else if (missingMP >= 300 && mpot0 !== undefined) {
                        await bot.useMPPot(mpot0)
                    } else {
                        await bot.regenMP()
                    }
                } else if (hpRatio < 1) {
                    if (bot.c.town || bot.c.fishing || bot.c.mining) {
                        await bot.regenHP()
                    } else if (missingHP >= 400 && hpot1 !== undefined) {
                        await bot.useHPPot(hpot1)
                    } else if (missingHP >= 200 && hpot0 !== undefined) {
                        await bot.useHPPot(hpot0)
                    } else {
                        await bot.regenHP()
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("healLoop", setTimeout(healLoop, Math.max(LOOP_MS, bot.getCooldown("use_hp"))))
    }
    healLoop()
}

export function startLootLoop(bot: Character, friends: Character[] = []): void {
    // Backup loot loop if we fail to open chests
    async function lootLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            // Loot chests in range of our character
            for (const [id, chest] of bot.chests) {
                if (Tools.distance(bot, chest) > 800) continue // Too far away to loot

                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.id == bot.id) continue // It's us
                    friend.chests.delete(id)
                }

                await bot.openChest(id)
                lootLoop()
                return
            }

            // Loot chests that are nowhere near any of our characters
            for (const [id, chest] of bot.chests) {
                if (Tools.distance(bot, chest) <= 800) continue // Close enough to loot

                let nearFriend = false
                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.id == bot.id) continue // It's us
                    if (Tools.distance(friend, chest) <= 800) {
                        // Close enough for them to loot
                        nearFriend = true
                        break
                    }
                }
                if (nearFriend) continue
                if (bot.party) {
                    for (const id in bot.partyData?.party) {
                        if (id == bot.id) continue // It's us
                        const partyMember = bot.partyData.party[id]
                        if (Tools.distance(partyMember, chest) <= 800) {
                        // Close enough for them to loot
                            nearFriend = true
                            break
                        }
                    }
                    if (nearFriend) continue
                }

                for (const friend of friends) {
                    if (!friend) continue // No friend
                    if (friend.id == bot.id) continue // It's us
                    friend.chests.delete(id)
                }

                await bot.openChest(id)
                lootLoop()
                return
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("lootLoop", setTimeout(lootLoop, 100))
    }
    lootLoop()
}

export function startPartyLoop(bot: Character, leader: string, partyMembers?: string[]): void {
    if (bot.id == leader) {
        // Have the leader accept party requests
        bot.socket.on("invite", async (data: InviteData) => {
            try {
                if (partyMembers.includes(data.name)) {
                    await bot.acceptPartyInvite(data.name)
                }
            } catch (e) {
                console.error(e)
            }
        })
        bot.socket.on("request", async (data: { name: string }) => {
            try {
                if (partyMembers) {
                    if (!partyMembers.includes(data.name)) return // Discard requests from other players

                    // If there's an incoming request, and we're full, kick the lower priority characters
                    if (bot.partyData && bot.partyData.list.length >= 9) {
                        const requestPriority = partyMembers.length - partyMembers.indexOf(data.name)

                        let toKickMember: string
                        let toKickPriority = requestPriority

                        for (let i = bot.partyData.list.indexOf(bot.id) + 1; i < bot.partyData.list.length; i++) {
                            const memberName = bot.partyData.list[i]
                            if (!partyMembers.includes(memberName)) {
                                // Someone snuck in to our party
                                toKickMember = memberName
                                break
                            }

                            const memberPriority = partyMembers.length - partyMembers.indexOf(memberName)
                            if (memberPriority > toKickPriority) continue // This member has a higher priority
                            toKickPriority = memberPriority
                            toKickMember = memberName
                        }

                        if (toKickMember) {
                            // There's someone with a lower priority that we can kick
                            console.log(`Kicking ${toKickMember} so ${data.name} can join`)
                            await bot.kickPartyMember(toKickMember)
                        } else {
                            // The party is full of higher priority members
                            console.log(`Ignoring ${data.name}'s party request because we are full.`)
                            return
                        }
                    }
                }

                await bot.acceptPartyRequest(data.name)
            } catch (e) {
                console.error(e)
            }
        })
    }
    async function partyLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.party) {
                await bot.sendPartyRequest(leader)
            } else if (!(bot.partyData?.list?.includes(leader))) {
                // await bot.leaveParty()
                await bot.sendPartyRequest(leader)
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("partyLoop", setTimeout(partyLoop, 1000))
    }
    partyLoop()
}

export function startPartyInviteLoop(bot: Character, player: string): void {
    async function partyInviteLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (!bot.partyData?.list?.includes(player) /** Only invite if they're missing */
                && bot.partyData.list.length < 9 /** Don't invite if we're at capacity */) {
                bot.sendPartyInvite(player)
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("partyInviteLoop", setTimeout(partyInviteLoop, 10000))
    }
    partyInviteLoop()
}

export function startScareLoop(bot: Character): void {
    async function scareLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            let incomingDamage = 0
            for (const [, entity] of bot.entities) {
                if (entity.target !== bot.id) continue
                if (AL.Tools.distance(bot, entity) > entity.range + entity.speed) continue // Too far away from us to attack us
                incomingDamage += entity.calculateDamageRange(bot)[1]
            }

            // If any projectiles are coming from us, wait for them to hit before scaring
            for (const [, projectile] of bot.projectiles) {
                if (projectile.attacker == bot.id) {
                    // Wait until the projectile hits to scare
                    setTimeout(scareLoop, projectile.eta + 1)
                    return
                }
            }

            if (bot.canUse("scare", { ignoreEquipped: true })
                && (bot.hasItem("jacko") || bot.isEquipped("jacko"))
                && (
                    bot.isScared() // We are scared
                    || (bot.s.burned && bot.s.burned.intensity > bot.max_hp / 5) // We are burning pretty badly
                    || (bot.targets > 0 && bot.c.town) // We are teleporting
                    || (bot.targets > 0 && bot.hp < bot.max_hp * 0.25) // We are low on HP
                    || (incomingDamage > bot.hp) // We could literally die with the next attack
                )) {
                // Equip the jacko if we need to
                let inventoryPos: number
                if (!bot.canUse("scare") && bot.hasItem("jacko")) {
                    inventoryPos = bot.locateItem("jacko")
                    bot.equip(inventoryPos)
                }

                // Scare, because we are scared
                try {
                    await bot.scare()
                } catch (e) {
                    console.error(e)
                }

                // Re-equip our orb
                if (inventoryPos !== undefined) bot.equip(inventoryPos)
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("scareLoop", setTimeout(scareLoop, Math.max(LOOP_MS, bot.getCooldown("scare"))))
    }

    // If we have too many targets, we can't go through doors.
    bot.socket.on("game_response", (data: GameResponseData) => {
        if (typeof data == "string") {
            if (data == "cant_escape") {
                if (bot.isScared() || bot.targets >= 5) {
                    // Equip the jacko if we need to
                    let inventoryPos: number
                    if (!bot.canUse("scare") && bot.hasItem("jacko")) {
                        inventoryPos = bot.locateItem("jacko")
                        bot.equip(inventoryPos)
                    }

                    // Scare, because we are scared
                    bot.scare()

                    // Re-equip our orb
                    if (inventoryPos !== undefined) bot.equip(inventoryPos)
                }
            }
        }
    })

    scareLoop()
}

export function startSellLoop(bot: Character, itemsToSell = ITEMS_TO_SELL, itemsToList = ITEMS_TO_LIST): void {
    async function sellLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            // Sell items to NPC
            if (bot.canSell()) {
                // Sell things
                for (let i = 0; i < bot.items.length; i++) {
                    const item = bot.items[i]
                    if (!item) continue // No item in this slot
                    if (item.l) continue // Item is locked
                    if (item.p) continue // This item is special in some way
                    if (!((item.level ?? 0) <= itemsToSell[item.name])) continue // We don't want to sell this item

                    await bot.sell(i, item.q ?? 1)
                }
            }

            // Sell items to other merchants
            for (const [, player] of bot.players) {
                if (AL.Tools.distance(bot, player) > AL.Constants.NPC_INTERACTION_DISTANCE) continue // Too far away

                for (const s in player.slots) {
                    const slot = s as TradeSlotType
                    const item = player.slots[slot]
                    if (!item) continue // Nothing in the slot
                    if (!item.rid) continue // Not a trade item
                    if (!item.b) continue // They are selling, not buying

                    const q = bot.locateItem(item.name, bot.items, { level: item.level, locked: false, special: false })
                    if (q == undefined) continue // We don't have this item to sell
                    const priceWanted = itemsToList?.[item.name]?.[item.level ?? 0]
                    if (priceWanted == undefined) continue // We don't want to sell this item
                    if (item.price >= priceWanted) {
                        await bot.sellToMerchant(player.id, slot, item.rid, Math.min(q, item.q))
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("sellLoop", setTimeout(sellLoop, LOOP_MS))
    }
    sellLoop()
}

/**
 * Only send the items in `itemsToSend`.
 * @param bot
 * @param sendTo
 * @param itemsToSend
 * @param goldToHold
 */
export function startSendStuffAllowlistLoop(bot: Character, sendTo: string, itemsToSend: (ItemName)[], goldToHold = GOLD_TO_HOLD): void {
    async function sendStuffLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return
            const sendToPlayer = bot.players.get(sendTo)

            if (!sendToPlayer) {
                bot.timeouts.set("sendStuffAllowListLoop", setTimeout(sendStuffLoop, LOOP_MS))
                return
            }

            if (AL.Tools.distance(bot, sendToPlayer) < AL.Constants.NPC_INTERACTION_DISTANCE) {
                const extraGold = bot.gold - goldToHold
                if (extraGold > 0) await bot.sendGold(sendTo, extraGold)
                for (let i = 0; i < bot.items.length; i++) {
                    const item = bot.items[i]
                    if (!item) continue // No item
                    if (!itemsToSend.includes(item.name)) continue // Only send items in our list
                    if (item.l == "l") continue // Don't send locked items

                    try {
                        await bot.sendItem(sendTo, i, item.q)
                    } catch (e) {
                        // They're probably full
                        bot.timeouts.set("sendStuffAllowListLoop", setTimeout(sendStuffLoop, 5000))
                        return
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("sendStuffAllowListLoop", setTimeout(sendStuffLoop, LOOP_MS))
    }
    sendStuffLoop()
}

/**
 * Send all items except for those in `itemsToHold`
 * @param bot
 * @param sendTo
 * @param itemsToHold
 * @param goldToHold
 */
export function startSendStuffDenylistLoop(bot: Character, sendTo: string[], itemsToHold = ITEMS_TO_HOLD, goldToHold = 1_000_000): void {
    async function sendStuffLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return
            let sendToPlayer: Player
            for (const sendToName of sendTo) {
                sendToPlayer = bot.players.get(sendToName)
                if (sendToPlayer) break
            }

            if (!sendToPlayer) {
                bot.timeouts.set("sendStuffDenyListLoop", setTimeout(sendStuffLoop, 10000))
                return
            }

            if (AL.Tools.distance(bot, sendToPlayer) < AL.Constants.NPC_INTERACTION_DISTANCE) {
                const extraGold = bot.gold - goldToHold
                if (extraGold > 0) await bot.sendGold(sendToPlayer.id, extraGold)
                for (let i = 0; i < bot.items.length; i++) {
                    const item = bot.items[i]
                    if (!item) continue // No item
                    if (item.l == "l") continue // Don't send locked items
                    if (itemsToHold.has(item.name)) continue // Don't send important items

                    try {
                        await bot.sendItem(sendToPlayer.id, i, item.q)
                    } catch (e) {
                        // They're probably full
                        bot.timeouts.set("sendStuffDenyListLoop", setTimeout(sendStuffLoop, 5000))
                        return
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("sendStuffDenyListLoop", setTimeout(sendStuffLoop, LOOP_MS))
    }
    sendStuffLoop()
}

export function startServerPartyInviteLoop(bot: Character, ignore = [bot.id], sendInviteEveryMS = 300_000): void {
    const lastInvites = new Map<string, number>()
    async function serverPartyInviteLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            const players = await bot.getServerPlayers()
            for (const player of players) {
                if (player.name == bot.id) continue // It's us!
                if (bot.party && player.party == bot.party) continue // They're already in our party
                if (ignore.includes(player.name)) continue // Ignore
                if (ignore.includes(player.party)) continue // Ignore
                if (bot.partyData?.list?.length >= 9) break // We're full

                const lastInvite = lastInvites.get(player.name)
                if (lastInvite && lastInvite > Date.now() - sendInviteEveryMS) continue // Don't spam invites

                if (bot.party) {
                    // We have a party, let's invite more!
                    await bot.sendPartyInvite(player.name)
                    lastInvites.set(player.name, Date.now())
                } else {
                    // We don't have a party, let's invite more, or request to join theirs!
                    await bot.sendPartyInvite(player.name)
                    if (player.party) await bot.sendPartyRequest(player.name)
                    lastInvites.set(player.name, Date.now())
                }

                await sleep(1000)
            }
        } catch (e) {
            console.error(e)
        }
        bot.timeouts.set("serverPartyInviteLoop", setTimeout(serverPartyInviteLoop, 1000))
    }
    serverPartyInviteLoop()
}

export function startTrackerLoop(bot: Character): void {
    async function trackerLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.hasItem("tracker")) {
                await bot.getTrackerData()
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("trackerLoop", setTimeout(trackerLoop, CHECK_TRACKER_EVERY_MS))
    }
    trackerLoop()
}

export function startUpgradeLoop(bot: Character, itemsToSell: ItemLevelInfo = ITEMS_TO_SELL, itemsToUpgrade: Set<ItemName> = undefined): void {
    async function upgradeLoop() {
        try {
            if (!bot.socket || bot.socket.disconnected) return

            if (bot.q.upgrade) {
                // We are upgrading, we have to wait
                bot.timeouts.set("upgradeLoop", setTimeout(upgradeLoop, bot.q.upgrade.ms))
                return
            }
            if (bot.map.startsWith("bank")) {
                // We are in the bank, we have to wait
                bot.timeouts.set("upgradeLoop", setTimeout(upgradeLoop, LOOP_MS))
                return
            }

            const itemsByLevel = bot.locateItemsByLevel(bot.items, { excludeLockedItems: true })
            for (const dName in itemsByLevel) {
                const itemName = dName as ItemName
                const gInfo = bot.G.items[itemName]
                if (gInfo.upgrade == undefined) continue // Not upgradable
                if (itemsToUpgrade !== undefined && !itemsToUpgrade.has(itemName)) continue // We don't want to upgrade this item
                const level0Grade = gInfo.grades.lastIndexOf(0) + 1
                let foundOne = false
                for (let dLevel = 12; dLevel >= 0; dLevel--) {
                    const items = itemsByLevel[itemName][dLevel]
                    if (items == undefined) continue // No items of this type at this level
                    if (dLevel == UPGRADE_COMPOUND_LIMIT[itemName]) continue // We don't want to upgrade certain items past certain levels. However, if it's already over that level, upgrade it.

                    const grade = await bot.calculateItemGrade({ level: dLevel, name: itemName })
                    const scrollName = `scroll${grade}` as ItemName

                    if (dLevel >= 9 - level0Grade) {
                        // We don't want to upgrade high level items automatically
                        if (!foundOne) foundOne = true
                    } else {
                        for (let i = 0; i < items.length; i++) {
                            const slot = items[i]
                            if (!foundOne) {
                                foundOne = true
                                continue
                            }
                            const itemInfo = bot.items[slot]
                            if (!itemInfo.p && dLevel <= itemsToSell[itemName]) continue // We don't want to upgrade items we want to sell

                            let scrollPos = bot.locateItem(scrollName)
                            const primlingPos = bot.locateItem("offeringp")
                            try {
                                if (scrollPos == undefined && !bot.canBuy(scrollName)) continue // We can't buy a scroll for whatever reason :(
                                else if (scrollPos == undefined) scrollPos = await (bot.buy(scrollName)) as number

                                if ((ITEMS_TO_PRIMLING[itemName] && dLevel >= ITEMS_TO_PRIMLING[itemName])
                                    || (!ITEMS_TO_PRIMLING[itemName] && ((level0Grade == 0 && dLevel >= 8) || (level0Grade == 1 && dLevel >= 6) || (level0Grade == 2 && dLevel >= 4)))) {
                                    // We want to use an offeringp to upgrade these
                                    if (primlingPos == undefined) continue // We don't have any primlings
                                    if (!bot.s.massproduction && bot.canUse("massproduction")) (bot as Merchant).massProduction()
                                    await bot.upgrade(slot, scrollPos, primlingPos)
                                } else {
                                    // We don't want to use an offeringp to upgrade these
                                    if (!bot.s.massproduction && bot.canUse("massproduction")) (bot as Merchant).massProduction()
                                    await bot.upgrade(slot, scrollPos)
                                }
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

        bot.timeouts.set("upgradeLoop", setTimeout(upgradeLoop, LOOP_MS))
    }
    upgradeLoop()
}

const types: { [T in ItemType]: number } = {
    token: 1,
    tracker: 2,
    computer: 3,
    pot: 4,
    weapon: 5,
    tool: 6,
    shield: 7,
    quiver: 8,
    source: 9,
    misc_offhand: 10,
    helmet: 11,
    chest: 12,
    gloves: 13,
    pants: 14,
    shoes: 15,
    earring: 16,
    amulet: 17,
    cape: 18,
    ring: 19,
    belt: 20,
    orb: 21,
    elixir: 22,
    throw: 23,
    cosmetics: 24,
    stand: 25,
    uscroll: 26,
    cscroll: 27,
    pscroll: 28,
    offering: 29,
    skill_item: 30,
    xp: 31,
    booster: 32,
    stone: 33,
    tome: 34,
    qubics: 35,
    material: 36,
    gem: 37,
    box: 38,
    jar: 39,
    quest: 40,
    container: 41,
    bank_key: 42,
    dungeon_key: 43,
    licence: 44,
    petlicence: 45,
    flute: 46,
    chrysalis: 47,
    spawner: 48,
    activator: 49,
    misc: 50,
    test: 51,
    placeholder: 52
}
type SortData = { id: number, item: ItemData, currentI: number, toI?: number, type: number, tier: number, toPack?: BankPackName, fromPack?: BankPackName }
const sortFn = (a: SortData, b: SortData) => {
    if (a.type == b.type) {
        if (a.tier == b.tier) {
            if (a.item.name == b.item.name) {
                if (a.item.level == b.item.level) {
                    if (a.item.p && !b.item.p) return -1
                    if (!a.item.p && b.item.p) return 1
                    if (a.item.p < b.item.p) return -1
                    return 1
                }
                return b.item.level - a.item.level
            }
            if (a.item.name < b.item.name) return -1
            return 1
        }
        return b.tier - a.tier
    }
    return a.type - b.type
}

export async function sortInventory(bot: Character, items: ItemData[] = bot.items, bankPack?: BankPackName): Promise<void> {
    const data: SortData[] = []

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue
        const gItem = bot.G.items[item.name]
        data.push({ id: i, item: item, currentI: i, type: types[gItem.type], tier: gItem.tier })
    }

    data.sort(sortFn)

    for (let i = 0; i < data.length; i++) {
        data[i].toI = i
    }

    for (const item of data) {
        let otherItem = undefined
        if (item.currentI == item.toI) continue
        const current = items[item.toI]
        if (current) {
            otherItem = data.find(a => a.currentI == item.toI)
        }
        if (bankPack) {
            try {
                await bot.swapBankItems(item.currentI, item.toI, bankPack).catch(() => { /* */ })
            } catch (e) {
                console.error(e)
            }
        } else {
            try {
                await bot.swapItems(item.currentI, item.toI).catch(() => { /* */ })
            } catch (e) {
                console.error(e)
            }
        }
        if (otherItem) otherItem.currentI = item.currentI
        item.currentI = item.toI
    }
}

export async function sortBank(bot: Character): Promise<void> {
    const items: SortData[] = []
    for (const pack in bot.bank) {
        if (pack == "gold") continue
        const packItems: ItemData[] = bot.bank[pack]
        for (let i = 0; i < packItems.length; i++) {
            const item = packItems[i]
            if (!item) continue
            const gItem = bot.G.items[item.name]
            items.push({ id: i, currentI: i, fromPack: pack as BankPackName, item: item, type: types[gItem.type], tier: gItem.tier })
        }
    }

    items.sort(sortFn)

    for (let i = 0; i < items.length; i++) {
        const toPack = `items${Math.floor(i / 42)}` as Exclude<BankPackName, "gold">
        items[i].toPack = toPack
    }

    const fromPacks: SortData[][] = []
    for (const pack in bot.bank) {
        if (pack == "gold") continue
        fromPacks.push(items.filter(a => a.fromPack == pack && a.toPack !== pack))
    }

    const toBeMoved: [number, SortData][] = []
    const swapPacks = async (from: SortData[]) => {
        let index = 0
        if (from.length > 0) {
            while (bot.esize > (from.length - index) && index < from.length) {
                const i = bot.getFirstEmptyInventorySlot(bot.items)
                const item = from[index]
                index++
                await bot.withdrawItem(item.fromPack, item.currentI, i).catch(() => { /* */ })
                if (bot.bank[item.toPack].filter(a => a == null).length > 0) {
                    await bot.depositItem(i, item.toPack).catch(() => { /* */ })
                } else {
                    toBeMoved.push([i, item])
                }
            }
        }
    }
    for (const pack of fromPacks) {
        await swapPacks(pack)
    }

    for (const [index, item] of toBeMoved) await bot.depositItem(index, item.toPack)

    for (const pack in bot.bank) {
        if (pack == "gold") continue
        await bot.requestPlayerData()
        await sortInventory(bot, bot.bank[pack], pack as BankPackName)
    }
}