import { Character, IPosition, ItemName, Pathfinder, Priest, Ranger, ServerInfoDataLive, Tools, Warrior } from "../../ALClient/build/index.js"
import { checkOnlyEveryMS, goToAggroMonster, goToNearestWalkableToMonster, goToNearestWalkableToMonster2, goToNPC, goToPriestIfHurt, goToSpecialMonster, kiteInCircle, moveInCircle, requestMagiportService } from "./base/general.js"
import { caveBatsNearCrypt, caveBatsNearDoor, caveBatsSouthEast, desertlandBScorpions, offsetPositionParty } from "./base/locations.js"
import { attackTheseTypesPriest } from "./base/priest.js"
import { attackTheseTypesRanger } from "./base/ranger.js"
import { attackTheseTypesWarrior } from "./base/warrior.js"
import { EquipmentInfo, MerchantStrategy, Strategy } from "./definitions/bot.js"

const armor: EquipmentInfo = {
    helmet: "hhelmet",
    chest: "harmor",
    gloves: "hgloves",
    pants: "hpants",
    shoes: "hboots"
}

const clothes: EquipmentInfo = {
    helmet: "mchat",
    chest: "mcarmor",
    gloves: "mcgloves",
    pants: "mcpants",
    shoes: "mcboots"
}

const luckyArmor: EquipmentInfo = {
    helmet: "wcap",
    chest: "wattire",
    gloves: "wgloves",
    pants: "wbreeches",
    shoes: "wshoes"
}

const strAccessories: EquipmentInfo = {
    earring1: "cearring",
    earring2: "cearring",
    cape: "bcape",
    ring1: "strring",
    ring2: "strring",
    belt: "strbelt",
    orb: "orbofstr",
    amulet: "snring"
}

const intAccessories: EquipmentInfo = {
    earring1: "intearring",
    earring2: "intearring",
    cape: "bcape",
    ring1: "intring",
    ring2: "intring",
    belt: "intbelt",
    orb: "orbofint",
    amulet: "t2intamulet"
}

const dexAccessories: EquipmentInfo = {
    earring1: "dexearring",
    earring2: "dexearring",
    cape: "bcape",
    ring1: "dexring",
    ring2: "dexring",
    belt: "dexbelt",
    orb: "orbofdex",
    amulet: "t2dexamulet"
}

const luckyAccessories: EquipmentInfo = {
    earring1: "mearring",
    earring2: "mearring",
    cape: "bcape",
    ring1: "ringofluck",
    ring2: "ringofluck",
    orb: "rabbitsfoot",
    amulet: "spookyamulet"
}

const mageGear: EquipmentInfo = {
    ...armor,
    ...intAccessories
}

const merchantGear: EquipmentInfo = {
    ...clothes,
    ...intAccessories
}

const merchantEquipment: EquipmentInfo = {
    ...merchantGear,
    mainhand: "broom"
}

const paladinGear: EquipmentInfo = {
    ...armor,
    ...strAccessories
}

const paladinEquipment: EquipmentInfo = {
    ...paladinGear,
    mainhand: "vhammer",
    offhand: "exoarm"
}

const priestGear: EquipmentInfo = {
    ...armor,
    ...intAccessories,
    orb: "jacko"
}

const rangerGear: EquipmentInfo = {
    ...armor,
    ...dexAccessories,
    orb: "jacko"
}

const rogueGear: EquipmentInfo = {
    ...armor,
    ...dexAccessories
}

const warriorGear: EquipmentInfo = {
    ...armor,
    ...strAccessories,
    orb: "jacko"
}

const mageAttackSpeed: EquipmentInfo = {
    ...mageGear,
    mainhand: "wand",
    offhand: "wbook1"
}

const mageDamage: EquipmentInfo = {
    ...mageGear,
    mainhand: "firestaff",
    offhand: "wbook1"
}

const priestAttackSpeed: EquipmentInfo = {
    ...priestGear,
    offhand: undefined,
    mainhand: "wand"
}

const priestDamage: EquipmentInfo = {
    ...priestGear,
    mainhand: "pmace",
    offhand: "wbook0"
}

const priestLuck: EquipmentInfo = {
    ...luckyArmor,
    ...luckyAccessories,
    mainhand: "lmace",
    offhand: "wbookhs"
}

const rangerCrit: EquipmentInfo = {
    ...rangerGear,
    mainhand: "t3bow",
    offhand: "t2quiver"
}

const rangerDamage: EquipmentInfo = {
    ...rangerGear,
    mainhand: "crossbow",
    offhand: "t2quiver"
}

const rogueAttackSpeed: EquipmentInfo = {
    ...rogueGear,
    offhand: undefined,
    mainhand: "rapier"
}

const rogueDamage: EquipmentInfo = {
    ...rogueGear,
    mainhand: "firestars",
    offhand: "vdagger"
}

const warriorAOE: EquipmentInfo = {
    ...warriorGear,
    mainhand: "ololipop",
    offhand: "glolipop"
}

const warriorBow: EquipmentInfo = {
    ...warriorGear,
    offhand: undefined,
    mainhand: "t3bow"
}

const warriorBurn: EquipmentInfo = {
    ...warriorGear,
    mainhand: "fireblade",
    offhand: "fireblade"
}

const warriorLuck: EquipmentInfo = {
    ...luckyArmor,
    ...luckyAccessories,
    mainhand: "fireblade",
    offhand: "mshield"
}

export const mageStrategy: Strategy = {}

export const merchantStrategy: MerchantStrategy = {
    buy: {
        gold: new Set<ItemName>([
            "lostearring", "broom", "xhelmet", "xarmor",
            "xgloves", "xpants", "xboots", "bataxe", "scythe"
        ]),
        monstertoken: new Set<ItemName>(["funtoken"]),
        funtoken: new Set<ItemName>(["rabbitsfoot", "xshield", "exoarm"])
    },
    compound: new Set<ItemName>([
        // earrings
        "strearring", "intearring", "dexearring", "cearring",
        // amulets
        "t2stramulet", "t2intamulet", "t2dexamulet", "skullamulet",
        // orbs
        "orbofstr", "orbofint", "orbofdex", "jacko", "orbg", "rabbitsfoot",
        // rings
        "ctristone", "cring", "ringofluck",
        // belts
        "strbelt", "intbelt", "dexbelt",
        // offhands
        "wbook1",
    ]),
    craft: new Set<ItemName>([
        // weapons
        "firebow", "frostbow", "firestars",
        // gloves
        "fierygloves",
        // boots
        "wingedboots",
        // orbs
        "orbg",
        // rings
        "ctristone", "resistancering", "armorring",
        // elixirs
        "elixirdex1", "elixirdex2", "elixirint1", "elixirint2", "elixirstr1", "elixirstr2", "elixirvit1", "elixirvit2"
    ]),
    dismantle: new Set<ItemName>([
        "lostearring"
    ]),
    exchange: new Set<ItemName>([
        "5bucks", "gem0", "gem1", "gemfragment", "seashell", "leather", "candycane",
        "mistletoe", "ornament", "candy0", "candy1", "greenenvelope", "redenvelope",
        "basketofeggs", "armorbox", "bugbountybox", "gift0", "gift1", "mysterybox",
        "weaponbox", "xbox"
    ]),
    fight: false,
    fish: true,
    hold: new Set<ItemName>([
        // computers
        "computer", "supercomputer", "tracker",
        // boosters
        "luckbooster", "goldbooster", "xpbooster",
        // pots
        "hpot1", "mpot1",
        // stand
        "stand0",
        // tokens
        "monstertoken", "funtoken",
        // upgrade/compound scrolls
        "cscroll0", "cscroll1", "cscroll2", "cscroll3", "scroll0", "scroll1", "scroll2", "scroll3", "scroll4",
        // stat scrolls
        "strscroll", "intscroll", "dexscroll",
        // offerings
        "offering", "offeringp", "broom", "pickaxe", "rod",
        // items to keep track of for upgrading/compounding
        "rabbitsfoot"
    ]),
    list: {
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
        "tracker": {
            0: 1_600_000
        },
        "vitring": {
            2: 2_000_000
        }
    },
    maxGold: 100_000_000,
    mine: true,
    mluckStrangers: false,
    sell: {
        // misc weapons
        "cclaw": 0, "slimestaff": 0, "stinger": 0, "sword": 0, "spear": 0, "xmace": 0,
        // misc offhands
        "quiver": 0, "wbook0": 0, "wshield": 0,
        // helmets
        "gphelmet": 0, "phelmet": 0, "helmet": 0, "helmet1": 0,
        // armors
        "coat1": 0, "coat": 0,
        // gloves
        "gloves1": 0,
        // pants
        "pants1": 0, "pants": 0,
        // shoes
        "shoes1": 0, "iceskates": 0,
        // accessories
        "hpamulet": 0, "hpbelt": 0, "ringsj": 0,
        "intamulet": 0, "dexamulet": 0, "stramulet": 0,
        // capes
        "cape": 0, "mcape": 0,
        // misc items
        "snowball": 0
    },
    upgrade: new Set<ItemName>([
        // weapons
        "fireblade", "firestaff", "ololipop", "glolipop", "t3bow", "crossbow", "oozingterror",
        "basher", "woodensword", "firebow", "frostbow", "pmace", "wand", "firestars", "dagger",
        "bowofthedead", "daggerofthedead", "maceofthedead", "pmaceofthedead", "swordofthedead",
        // tools
        "rod", "pickaxe",
        // shields
        "mshield", "xshield",
        // helmets
        "wcap", "xhelmet",
        // armors
        "wattire", "xarmor",
        // gloves
        "wgloves", "xgloves",
        // pants
        "wbreeches", "xpants",
        // shoes
        "wshoes", "xboots", "wingedboots",
        // capes
        "bcape"
    ])
}

export const paladinStrategy: Strategy = {}

export const priestStrategy: Strategy = {
    a2: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["a2"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "a2", { requestMagiport: true }) }
    },
    arcticbee: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["arcticbee"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "winterland", x: 1102, y: -873 }).catch(() => { /* */ }) },
    },
    armadillo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["armadillo", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: { mainhand: "pmace", offhand: "wbook1", orb: "jacko" },
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 546, y: 1846 }).catch(() => { /* */ }) },
    },
    bat: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["bat"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove(caveBatsNearCrypt).catch(() => { /* */ }) },
    },
    bbpompom: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["bbpompom"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "winter_cave", x: 71, y: -164 }).catch(() => { /* */ }) },
    },
    bee: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["bee"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 152, y: 1487 }).catch(() => { /* */ }) },
    },
    bgoo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["bgoo", "rgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => {
            if (bot.map !== "goobrawl") await bot.smartMove("goobrawl").catch(() => { /* */ })
            goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
        },
    },
    bigbird: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["bigbird"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 1363, y: 248 }).catch(() => { /* */ }) },
    },
    boar: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["boar"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "winterland", x: 40, y: -1109 }).catch(() => { /* */ }) },
    },
    booboo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["booboo"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "spookytown", x: 265, y: -605 }).catch(() => { /* */ }) },
    },
    bscorpion: {
        attack: async (bot: Priest, friends: Character[]) => {
            // Get the bscorpion to target us if it's attacking a friend
            const bscorpion = bot.getEntity({ returnNearest: true, type: "bscorpion" })
            if (!bscorpion) {
                return
            }
            if (bscorpion.target && bscorpion.target !== bot.id && bscorpion.couldGiveCreditForKill(bot)) {
                await bot.absorbSins(bscorpion.target)
            }

            if (bscorpion && bscorpion.target == bot.id && bscorpion.hp < 50000) {
                // Equip items that have more luck
                if (bot.slots.mainhand?.name !== "lmace" && bot.hasItem("lmace")) await bot.equip(bot.locateItem("lmace"))
                if (bot.slots.orb?.name !== "rabbitsfoot" && bot.hasItem("rabbitsfoot")) await bot.equip(bot.locateItem("rabbitsfoot"))
                if (bot.slots.offhand?.name !== "mshield" && bot.hasItem("mshield")) await bot.equip(bot.locateItem("mshield"))
                if (bot.slots.shoes?.name !== "wshoes" && bot.hasItem("wshoes")) await bot.equip(bot.locateItem("wshoes"))
            } else {
                // Equip items that do more damage
                if (bot.slots.mainhand?.name !== "firestaff" && bot.hasItem("firestaff")) await bot.equip(bot.locateItem("firestaff"))
                if (bot.slots.orb?.name !== "orbofint" && bot.hasItem("orbofint")) await bot.equip(bot.locateItem("orbofint"))
                if (bot.slots.offhand?.name !== "wbook1" && bot.hasItem("wbook1")) await bot.equip(bot.locateItem("wbook1"))
                if (bot.slots.shoes?.name !== "wingedboots" && bot.hasItem("wingedboots")) await bot.equip(bot.locateItem("wingedboots"))
            }

            await attackTheseTypesPriest(bot, ["bscorpion"], friends)
        },
        equipment: { /** We have custom equipment in the attack loop above */ },
        move: async (bot: Priest) => { await kiteInCircle(bot, "bscorpion", desertlandBScorpions) }
    },
    cgoo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["cgoo"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 650, y: -500 }) },
    },
    crab: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["crab", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -1182, y: -66 }).catch(() => { /* */ }) },
    },
    crabx: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["crabx", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -964, y: 1762 }) },
    },
    crabxx: {
        attack: async (bot: Priest, friends: Character[]) => {
            await attackTheseTypesPriest(bot, ["crabx"], friends, { disableCreditCheck: true, disableZapper: true, healStrangers: true })
            await attackTheseTypesPriest(bot, ["crabxx", "crabx"], friends, { disableCreditCheck: true, healStrangers: true })
        },
        attackWhileIdle: false,
        equipment: priestDamage,
        move: async (bot: Priest) => {
            const nearest = bot.getEntity({ returnNearest: true, type: "crabxx" })
            if (nearest && Pathfinder.canWalkPath(bot, nearest)) {
                // Move close to other crabx to damage them and get crabxx taking damage
                goToNearestWalkableToMonster2(bot, ["crabxx", "crabx"], nearest)
            } else {
                await goToSpecialMonster(bot, "crabxx", { requestMagiport: true })
            }
        }
    },
    croc: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["croc", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 821, y: 1710 }).catch(() => { /* */ }) },
    },
    cutebee: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["cutebee"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => {
            const nearby = bot.getEntity({ returnNearest: true, type: "cutebee" })
            if (nearby) {
                if (!nearby.target) {
                    // The cutebee will avoid 99.9% of our attacks, so let's try to walk in front of it so that we can aggro it
                    await goToAggroMonster(bot, nearby)
                } else {
                    await goToNearestWalkableToMonster(bot, ["cutebee"])
                }
            } else {
                await goToSpecialMonster(bot, "cutebee", { requestMagiport: true })
            }
        }
    },
    dragold: {
        attack: async (bot: Priest, friends: Character[]) => {
            const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
            if (dragold && dragold.target
                && bot.party && !bot.partyData.list.includes[dragold.target] // It's not targeting someone in our party
                && bot.canUse("scare", { ignoreEquipped: true })) {
                if (bot.canUse("absorb") && Tools.distance(bot, bot.players.get(dragold.target)) < bot.G.skills.absorb.range) bot.absorbSins(dragold.target).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            await attackTheseTypesPriest(bot, ["dragold", "bat"], friends, { healStrangers: true })
        },
        equipment: { ...priestDamage, offhand: "wbookhs", orb: "test_orb" },
        move: async (bot: Priest) => {
            const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
            if (dragold) {
                if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                requestMagiportService(bot, bot.S.dragold as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }

            }
        },
    },
    fireroamer: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["fireroamer"], friends) },
        equipment: { ...priestDamage, offhand: "wbookhs", orb: "test_orb" },
        move: async (bot: Priest) => { await bot.smartMove({ map: "desertland", x: 180, y: -675 }).catch(() => { /* */ }) },
    },
    franky: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["nerfedmummy", "franky"], friends, { disableCreditCheck: true, healStrangers: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => {
            const nearest = bot.getEntity({ returnNearest: true, type: "franky" })
            if (nearest && Tools.distance(bot, nearest) > 25) {
                // Move close to Franky because other characters might help blast away mummies
                await bot.smartMove(nearest, { getWithin: 25 }).catch(() => { /* */ })
            } else {
                await goToSpecialMonster(bot, "franky", { requestMagiport: true })
            }
        }
    },
    frog: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["frog"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["frog"], { map: "main", x: -1124, y: 1118 }) },
    },
    fvampire: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["fvampire"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "fvampire", { requestMagiport: true }) },
    },
    ghost: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["ghost"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "halloween", x: 276, y: -1224 }).catch(() => { /* */ }) },
    },
    goldenbat: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["goldenbat"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
    },
    goo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["goo", "rgoo", "bgoo"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -12, y: 787 }).catch(() => { /* */ }) },
    },
    greenjr: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["greenjr", "snake", "osnake"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "greenjr", { requestMagiport: true }) },
    },
    grinch: {
        attack: async (bot: Priest, friends: Character[]) => {
            const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
            if (grinch && grinch.target
                && bot.party && !bot.partyData.list.includes[grinch.target] // It's not targeting someone in our party
                && bot.canUse("scare", { ignoreEquipped: true })) {
                if (bot.canUse("absorb") && Tools.distance(bot, bot.players.get(grinch.target)) < bot.G.skills.absorb.range) bot.absorbSins(grinch.target).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            await attackTheseTypesPriest(bot, ["grinch"], friends)
        },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => {
            if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                // Go to Kane when Grinch is nearing death for extra luck
                await goToNPC(bot, "citizen0")
                return
            }

            const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
            if (grinch) {
                // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                requestMagiportService(bot, bot.S.grinch as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }
            }
        }
    },
    hen: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["hen"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -41.5, y: -282 }).catch(() => { /* */ }) },
    },
    icegolem: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["icegolem"], friends, { healStrangers: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => {
            const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
            if (!iceGolem) {
                if (bot.S.icegolem as ServerInfoDataLive) await requestMagiportService(bot, bot.S.icegolem as IPosition)
                await bot.smartMove({ map: "winterland", x: 783, y: 277 }).catch(() => { /* */ })
            }
            if (iceGolem && !Pathfinder.canWalkPath(bot, iceGolem)) {
                // Cheat and walk across the water.
                await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true }).catch(() => { /* */ })
            } else if (iceGolem) {
                await goToNearestWalkableToMonster(bot, ["icegolem"])
            }
        },
    },
    iceroamer: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["iceroamer"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "winterland", x: 1492, y: 104 }).catch(() => { /* */ }) },
    },
    jr: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["jr"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
    },
    mechagnome: {
        attack: async (bot: Priest, friends: Character[]) => {
            await attackTheseTypesPriest(bot, ["mechagnome"], friends, { targetingPartyMember: true })
        },
        equipment: priestDamage,
        move: async (bot: Priest) => {
            await bot.smartMove({ map: "cyberland", x: 25, y: 0 })
            if (checkOnlyEveryMS("mainframe", 250)) bot.socket.emit("eval", { command: "stop" })
        }
    },
    minimush: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["minimush", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "halloween", x: 28, y: 631 }).catch(() => { /* */ }) },
    },
    mole: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["mole"], friends, { targetingPartyMember: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "tunnel", x: -35, y: -329 }).catch(() => { /* */ }) },
    },
    mrgreen: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["mrgreen"], friends, { healStrangers: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => {
            await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
        },
    },
    mrpumpkin: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["mrpumpkin"], friends, { healStrangers: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => {
            await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
        },
    },
    mummy: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["mummy"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "spookytown", x: 270, y: -1115 }).catch(() => { /* */ }) },
    },
    mvampire: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["mvampire", "bat"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
    },
    nerfedmummy: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["nerfedmummy"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "franky", { requestMagiport: true }) },
    },
    oneeye: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["oneeye"], friends, { targetingPartyMember: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "level2w", x: -155, y: 0 }).catch(() => { /* */ }) },
    },
    osnake: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["osnake", "snake"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: -488, y: -708 }) }
    },
    phoenix: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
    },
    pinkgoo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["pinkgoo"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => {
            const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
            if (pinkgoo) {
                const position = offsetPositionParty(pinkgoo, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        },
    },
    plantoid: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["plantoid"], friends, { targetingPartyMember: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "desertland", x: -900, y: -400 }).catch(() => { /* */ }) },
    },
    poisio: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["poisio"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -101, y: 1360 }).catch(() => { /* */ }) },
    },
    porcupine: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["porcupine"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "desertland", x: -809, y: 135 }).catch(() => { /* */ }) },
    },
    pppompom: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["pppompom"], friends, { targetingPartyMember: true }) },
        equipment: { mainhand: "firestaff", offhand: "lantern", orb: "jacko" },
        move: async (bot: Priest) => { await bot.smartMove({ map: "level2n", x: 120, y: -130 }).catch(() => { /* */ }) }
    },
    prat: {
        attack: async (bot: Priest, friends: Character[]) => {
            let friendTargeted = false
            for (const friend of friends) {
                if (friend && friend.id !== bot.id && friend.targets > 0) friendTargeted = true
            }
            if (friendTargeted) await attackTheseTypesPriest(bot, ["prat"], friends, { targetingPartyMember: true })
            else await attackTheseTypesPriest(bot, ["prat"], friends, { targetingPartyMember: false })
        },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "level1", x: -296, y: 557 }).catch(() => { /* */ }) },
    },
    rat: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["rat"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "mansion", x: -224, y: -313 }).catch(() => { /* */ }) },
    },
    rgoo: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["rgoo", "bgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => {
            const rgoo = bot.getEntity({ type: "rgoo" })
            if (rgoo) {
                goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
            } else {
                await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
            }
        },
    },
    rooster: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["rooster"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -41.5, y: -282 }).catch(() => { /* */ }) },
    },
    scorpion: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["scorpion", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 1598, y: -168 }).catch(() => { /* */ }) },
    },
    skeletor: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["skeletor", "cgoo"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 400, y: -575 }) },
    },
    snake: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["snake", "osnake"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -62, y: 1901 }).catch(() => { /* */ }) },
    },
    snowman: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["snowman"], friends) },
        attackWhileIdle: true,
        equipment: priestAttackSpeed,
        move: async (bot: Priest) => {
            await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
        }
    },
    spider: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["spider", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: 968, y: -144 }).catch(() => { /* */ }) },
    },
    squig: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["squig", "squigtoad", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -1155, y: 422 }).catch(() => { /* */ }) },
    },
    squigtoad: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["squigtoad", "squig", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "main", x: -1155, y: 422 }).catch(() => { /* */ }) }
    },
    stompy: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["stompy", "wolf", "wolfie", "boar"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "stompy", { requestMagiport: true }) }
    },
    stoneworm: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["stoneworm"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "spookytown", x: 697, y: 129 }).catch(() => { /* */ }) }
    },
    // tinyp: {
    //     attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["tinyp"], friends, { targetingPartyMember: true }) },
    //     equipment: priestDamage,
    //     move: async (bot: Priest) => { await goToSpecialMonster(bot, "tinyp", { requestMagiport: true }) }
    // },
    tiger: {
        attack: async (bot: Priest, friends: Character[]) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                if (bot.slots.offhand && bot.slots.offhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("offhand")
                if (bot.slots.mainhand && bot.slots.mainhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("mainhand")
                if (bot.slots.helmet && bot.slots.helmet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("helmet")
                if (bot.slots.chest && bot.slots.chest.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("chest")
                if (bot.slots.pants && bot.slots.pants.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("pants")
                if (bot.slots.shoes && bot.slots.shoes.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("shoes")
                if (bot.slots.gloves && bot.slots.gloves.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("gloves")
                if (bot.slots.orb && bot.slots.orb.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("orb")
                if (bot.slots.amulet && bot.slots.amulet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("amulet")
                if (bot.slots.earring1 && bot.slots.earring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring1")
                if (bot.slots.earring2 && bot.slots.earring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring2")
                if (bot.slots.ring1 && bot.slots.ring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring1")
                if (bot.slots.ring2 && bot.slots.ring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring2")
                if (bot.slots.cape && bot.slots.cape.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("cape")
                if (bot.slots.belt && bot.slots.belt.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("belt")
            }
            await attackTheseTypesPriest(bot, ["tiger"], friends)
        },
        attackWhileIdle: true,
        move: async (bot: Priest) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                const position = offsetPositionParty(tiger, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true })
            }
        }
    },
    tortoise: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["tortoise", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1104, y: 1118 }) },
    },
    vbat: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["vbat"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
    },
    wabbit: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["wabbit"], friends) },
        attackWhileIdle: true,
        equipment: priestDamage,
        move: async (bot: Priest) => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) },
    },
    wolf: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["wolf"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "winterland", x: 420, y: -2525 }).catch(() => { /* */ }) },
    },
    wolfie: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["wolfie"], friends) },
        equipment: priestDamage,
        move: async (bot: Priest) => { goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -149, y: -2026 }) },
    },
    xscorpion: {
        attack: async (bot: Priest, friends: Character[]) => { await attackTheseTypesPriest(bot, ["xscorpion"], friends, { targetingPartyMember: true }) },
        equipment: priestDamage,
        move: async (bot: Priest) => { await bot.smartMove({ map: "halloween", x: -325, y: 725 }).catch(() => { /* */ }) },
    }
}

export const rangerStrategy: Strategy = {
    a2: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["a2"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "a2", { requestMagiport: true }) }
    },
    arcticbee: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["arcticbee"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "winterland", x: 1082, y: -873 }).catch(() => { /* */ }) },
    },
    armadillo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["armadillo", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 526, y: 1846 }).catch(() => { /* */ }) },
    },
    bat: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bat"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove(caveBatsNearDoor).catch(() => { /* */ }) },
    },
    bbpompom: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bbpompom"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "winter_cave", x: 51, y: -164 }).catch(() => { /* */ }) },
    },
    bee: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bee"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 494, y: 1101 }).catch(() => { /* */ }) },
    },
    bgoo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bgoo", "rgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            if (bot.map !== "goobrawl") await bot.smartMove("goobrawl").catch(() => { /* */ })
            goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
        },
    },
    bigbird: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bigbird"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 1343, y: 248 }).catch(() => { /* */ }) },
    },
    boar: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["boar"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "winterland", x: 20, y: -1109 }).catch(() => { /* */ }) },
    },
    booboo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["booboo"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "spookytown", x: 265, y: -645 }).catch(() => { /* */ }) },
    },
    bscorpion: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["bscorpion"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await kiteInCircle(bot, "bscorpion", desertlandBScorpions) },
        requireCtype: "priest"
    },
    cgoo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["cgoo"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 0, y: -500 }) },
    },
    crab: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["crab", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -1202, y: -66 }).catch(() => { /* */ }) },
    },
    crabx: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["crabx", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -1202, y: -66 }) },
    },
    crabxx: {
        attack: async (bot: Ranger, friends: Character[]) => {
            await attackTheseTypesRanger(bot, ["crabx"], friends, { disableCreditCheck: true, disableZapper: true })
            await attackTheseTypesRanger(bot, ["crabxx", "crabx"], friends, { disableCreditCheck: true })
        },
        attackWhileIdle: false,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const nearest = bot.getEntity({ returnNearest: true, type: "crabxx" })
            if (nearest && Pathfinder.canWalkPath(bot, nearest)) {
                // Move close to other crabx to damage them and get crabxx taking damage
                goToNearestWalkableToMonster2(bot, ["crabxx", "crabx"], nearest)
            } else {
                await goToSpecialMonster(bot, "crabxx", { requestMagiport: true })
            }
        }
    },
    croc: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["croc", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 801, y: 1710 }).catch(() => { /* */ }) },
    },
    cutebee: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["cutebee"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const nearby = bot.getEntity({ returnNearest: true, type: "cutebee" })
            if (nearby) {
                if (!nearby.target) {
                    // The cutebee will avoid 99.9% of our attacks, so let's try to walk in front of it so that we can aggro it
                    await goToAggroMonster(bot, nearby)
                } else {
                    await goToNearestWalkableToMonster(bot, ["cutebee"])
                }
            } else {
                await goToSpecialMonster(bot, "cutebee", { requestMagiport: true })
            }
        }
    },
    dragold: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["dragold", "bat"], friends) },
        equipment: { chest: "harmor", gloves: "hgloves", helmet: "cyber", mainhand: "firebow", offhand: "t2quiver", orb: "test_orb", pants: "hpants", shoes: "wingedboots" },
        move: async (bot: Ranger, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)

            const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
            if (dragold) {
                if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                requestMagiportService(bot, bot.S.dragold as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }

            }
        },
        requireCtype: "priest"
    },
    fireroamer: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["fireroamer"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "desertland", x: 160, y: -675 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    franky: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["nerfedmummy", "franky"], friends, { disableCreditCheck: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const nearest = bot.getEntity({ returnNearest: true, type: "franky" })
            if (nearest && Tools.distance(bot, nearest) > 25) {
                // Move close to Franky because other characters might help blast away mummies
                await bot.smartMove(nearest, { getWithin: 25 }).catch(() => { /* */ })
            } else {
                await goToSpecialMonster(bot, "franky", { requestMagiport: true })
            }
        },
        requireCtype: "priest"
    },
    fvampire: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["fvampire", "ghost"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "fvampire", { requestMagiport: true }) },
        requireCtype: "priest"
    },
    ghost: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["ghost"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "halloween", x: 256, y: -1224 }).catch(() => { /* */ }) }
    },
    goldenbat: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["goldenbat"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
    },
    goo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["goo", "rgoo", "bgoo"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -32, y: 787 }).catch(() => { /* */ }) },
    },
    greenjr: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["greenjr", "snake", "osnake"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove("greenjr").catch(() => { /* */ }) },
    },
    grinch: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["grinch"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                // Go to Kane when Grinch is nearing death for extra luck
                await goToNPC(bot, "citizen0")
                return
            }

            const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
            if (grinch) {
                // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                requestMagiportService(bot, bot.S.grinch as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }
            }
        }
    },
    hen: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["hen"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -61.5, y: -282 }).catch(() => { /* */ }) },
    },
    icegolem: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["icegolem"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
            if (!iceGolem) {
                if (bot.S.icegolem as ServerInfoDataLive) requestMagiportService(bot, bot.S.icegolem as IPosition)
                await bot.smartMove({ map: "winterland", x: 783, y: 277 }).catch(() => { /* */ })
            }
            if (iceGolem && !Pathfinder.canWalkPath(bot, iceGolem)) {
                // Cheat and walk across the water.
                await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true }).catch(() => { /* */ })
            } else if (iceGolem) {
                await goToNearestWalkableToMonster(bot, ["icegolem"])
            }
        },
    },
    iceroamer: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["iceroamer"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "winterland", x: 1512, y: 104 }).catch(() => { /* */ }) },
    },
    jr: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["jr"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
    },
    mechagnome: {
        attack: async (bot: Ranger, friends: Character[]) => {
            await attackTheseTypesRanger(bot, ["mechagnome"], friends, { targetingPartyMember: true })
        },
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            await bot.smartMove({ map: "cyberland", x: -25, y: 0 })
            if (checkOnlyEveryMS("mainframe", 250)) bot.socket.emit("eval", { command: "stop" })
        }
    },
    minimush: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["minimush", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "halloween", x: 8, y: 631 }).catch(() => { /* */ }) },
    },
    mole: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["mole"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "tunnel", x: -15, y: -329 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    mrgreen: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["mrgreen"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    mrpumpkin: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["mrpumpkin"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    mummy: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["mummy"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "spookytown", x: 255, y: -1115 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    mvampire: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["mvampire", "bat"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
    },
    nerfedmummy: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["nerfedmummy"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove("franky").catch(() => { /* */ }) },
    },
    oneeye: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["oneeye"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "level2w", x: -175, y: 0 }).catch(() => { /* */ }) },
        requireCtype: "priest",
    },
    osnake: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["osnake", "snake"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: -589, y: -335 }) }
    },
    phoenix: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
    },
    pinkgoo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["pinkgoo", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
            if (pinkgoo) {
                const position = offsetPositionParty(pinkgoo, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        },
    },
    plantoid: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["plantoid"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "desertland", x: -700, y: -400 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    poisio: {
        // TODO: If we can 1shot with hbow, use that instead
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["poisio"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -121, y: 1360 }).catch(() => { /* */ }) },
    },
    porcupine: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["porcupine"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "desertland", x: -829, y: 135 }).catch(() => { /* */ }) },
    },
    pppompom: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["pppompom"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "level2n", x: 120, y: -170 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    prat: {
        attack: async (bot: Ranger, friends: Character[]) => {
            let friendTargeted = false
            for (const friend of friends) {
                if (friend && friend.id !== bot.id && friend.targets > 0) friendTargeted = true
            }
            if (friendTargeted) await attackTheseTypesRanger(bot, ["prat"], friends, { targetingPartyMember: true })
            else await attackTheseTypesRanger(bot, ["prat"], friends, { targetingPartyMember: false })
        },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "level1", x: -280, y: 541 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    rat: {
        // TODO: Optimize positioning
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["rat"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "mansion", x: 100, y: -225 }).catch(() => { /* */ }) },
    },
    rgoo: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["rgoo", "bgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            const rgoo = bot.getEntity({ type: "rgoo" })
            if (rgoo) {
                goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
            } else {
                await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
            }
        },
    },
    rooster: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["rooster"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -61.5, y: -282 }).catch(() => { /* */ }) },
    },
    scorpion: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["scorpion", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 1578, y: -168 }).catch(() => { /* */ }) },
    },
    skeletor: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["skeletor", "cgoo"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 380, y: -575 }) },
        requireCtype: "priest",
    },
    slenderman: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["slenderman"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "slenderman", { requestMagiport: true }) }
    },
    snake: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["snake", "osnake"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -82, y: 1901 }).catch(() => { /* */ }) },
    },
    snowman: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["snowman", "arcticbee", "boar", "wolf", "wolfie"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => {
            await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
        },
    },
    spider: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["spider", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: 948, y: -144 }).catch(() => { /* */ }) },
    },
    squig: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["squig", "squigtoad", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -1175, y: 422 }).catch(() => { /* */ }) },
    },
    squigtoad: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["squigtoad", "squig", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "main", x: -1175, y: 422 }).catch(() => { /* */ }) },
    },
    stompy: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["stompy", "wolf", "wolfie", "boar"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "stompy", { requestMagiport: true }) },
        requireCtype: "priest"
    },
    stoneworm: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["stoneworm"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "spookytown", x: 677, y: 129 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    // tinyp: {
    //     attack: async (bot: Ranger, friends: Character[]) => {
    //         const tinyp = bot.getEntity({ returnNearest: true, type: "tinyp" })
    //         if (tinyp && bot.canUse("supershot") && Tools.distance(bot, tinyp) < bot.range * bot.G.skills.supershot.range_multiplier) {
    //             await bot.superShot(tinyp.id)
    //         }
    //         await attackTheseTypesRanger(bot, ["minimush", "osnake", "snake"], friends, { disableHuntersMark: true, disableSupershot: true })
    //         return
    //     },
    //     equipment: rangerDamage,
    //     move: async (bot: Ranger) => {
    //         await goToSpecialMonster(bot, "tinyp", { requestMagiport: true })
    //     }
    // },
    tiger: {
        attack: async (bot: Ranger, friends: Character[]) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                if (bot.slots.offhand && bot.slots.offhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("offhand")
                if (bot.slots.mainhand && bot.slots.mainhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("mainhand")
                if (bot.slots.helmet && bot.slots.helmet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("helmet")
                if (bot.slots.chest && bot.slots.chest.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("chest")
                if (bot.slots.pants && bot.slots.pants.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("pants")
                if (bot.slots.shoes && bot.slots.shoes.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("shoes")
                if (bot.slots.gloves && bot.slots.gloves.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("gloves")
                if (bot.slots.orb && bot.slots.orb.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("orb")
                if (bot.slots.amulet && bot.slots.amulet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("amulet")
                if (bot.slots.earring1 && bot.slots.earring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring1")
                if (bot.slots.earring2 && bot.slots.earring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring2")
                if (bot.slots.ring1 && bot.slots.ring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring1")
                if (bot.slots.ring2 && bot.slots.ring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring2")
                if (bot.slots.cape && bot.slots.cape.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("cape")
                if (bot.slots.belt && bot.slots.belt.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("belt")
            }
            await attackTheseTypesRanger(bot, ["tiger", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], friends)
        },
        attackWhileIdle: true,
        move: async (bot: Ranger) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                const position = offsetPositionParty(tiger, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true }).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        }
    },
    tortoise: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["tortoise", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1124, y: 1118 }) },
    },
    vbat: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["vbat"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
    },
    wabbit: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["wabbit", "arcticbee", "bat", "bbpompom", "bee", "boar", "cgoo", "crab", "cutebee", "crabx", "croc", "fvampire", "ghost", "goldenbat", "goo", "greenjr", "hen", "jr", "minimush", "mole", "mvampire", "osnake", "phoenix", "poisio", "rooster", "scorpion", "snake", "spider", "stoneworm", "stompy", "squig", "squigtoad", "tortoise", "wolf", "wolfie", "xscorpion"], friends) },
        attackWhileIdle: true,
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) }
    },
    wolf: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["wolf"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "winterland", x: 400, y: -2525 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    wolfie: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["wolfie"], friends) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -169, y: -2026 }) },
        requireCtype: "priest"
    },
    xscorpion: {
        attack: async (bot: Ranger, friends: Character[]) => { await attackTheseTypesRanger(bot, ["xscorpion"], friends, { targetingPartyMember: true }) },
        equipment: rangerDamage,
        move: async (bot: Ranger) => { await bot.smartMove({ map: "halloween", x: -325, y: 775 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    }
}

export const rogueStrategy: Strategy = {}

export const warriorStrategy: Strategy = {
    a2: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["vbat"], friends, { disableAgitate: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
    },
    arcticbee: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["arcticbee"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["arcticbee"], { map: "winterland", x: 1062, y: -873 }) },
    },
    bat: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bat"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["bat"], caveBatsSouthEast) },
    },
    bbpompom: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bbpompom"], friends, { disableAgitate: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["bbpompom"], { map: "winter_cave", x: 31, y: -164 })
        },
    },
    bee: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bee"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["bee"], { map: "main", x: 737, y: 720 }) },
    },
    bgoo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bgoo", "rgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            if (bot.map !== "goobrawl") await bot.smartMove("goobrawl").catch(() => { /* */ })
            goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
        },
    },
    bigbird: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bigbird"], friends) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "main", x: 1323, y: 248 }).catch(() => { /* */ }) },
        requireCtype: "priest",
    },
    boar: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["boar"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "winterland", x: 0, y: -1109 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    booboo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["booboo"], friends, { maximumTargets: 1 }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "spookytown", x: 265, y: -625 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    bscorpion: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["bscorpion"], friends, { disableAgitate: true, targetingPartyMember: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            const nearest = bot.getEntity({ returnNearest: true, type: "bscorpion" })
            if (nearest && nearest.target && nearest.couldGiveCreditForKill(bot)) {
                goToNearestWalkableToMonster2(bot, ["bscorpion"], desertlandBScorpions)
            } else {
                await kiteInCircle(bot, "bscorpion", desertlandBScorpions)
            }
        },
        requireCtype: "priest"
    },
    cgoo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["cgoo"], friends) },
        equipment: warriorAOE,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 151.6, y: 40.82 })
        },
    },
    crab: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["crab", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["crab"], { map: "main", x: -1222, y: -66 }) },
    },
    crabx: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["crabx", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -1004, y: 1762 }) },
    },
    crabxx: {
        attack: async (bot: Warrior, friends: Character[]) => {
            await attackTheseTypesWarrior(bot, ["crabx"], friends, { disableCreditCheck: true })
            await attackTheseTypesWarrior(bot, ["crabxx", "crabx"], friends, { disableCreditCheck: true })
        },
        attackWhileIdle: true,
        equipment: warriorAOE,
        requireCtype: "priest",
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "crabxx", { requestMagiport: true }) },
    },
    croc: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["croc", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["croc"], { map: "main", x: 781, y: 1710 }) },
    },
    cutebee: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["cutebee", "bee", "crab", "croc", "goo", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            const nearby = bot.getEntity({ returnNearest: true, type: "cutebee" })
            if (nearby) {
                if (!nearby.target) {
                    // The cutebee will avoid 99.9% of our attacks, so let's try to walk in front of it so that we can aggro it
                    await goToAggroMonster(bot, nearby)
                } else {
                    await goToNearestWalkableToMonster(bot, ["cutebee"])
                }
            } else {
                await goToSpecialMonster(bot, "cutebee", { requestMagiport: true })
            }
        },
    },
    dragold: {
        attack: async (bot: Warrior, friends: Character[]) => {
            const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
            const priest = friends.find(value => value.ctype == "priest")
            if (dragold
                && bot.party && !bot.partyData.list.includes[dragold.target] // It's not targeting someone in our party
                && priest && Tools.distance(bot, priest) < priest.range
                && bot.canUse("scare", { ignoreEquipped: true })) {
                if (bot.canUse("taunt") && Tools.distance(dragold, bot) < bot.G.skills.taunt.range) bot.taunt(dragold.id).catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (bot.canUse("agitate") && Tools.distance(bot, dragold) < bot.G.skills.agitate.range) bot.agitate().catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            await attackTheseTypesWarrior(bot, ["dragold", "bat"], friends)
        },
        equipment: { ...warriorAOE, orb: "test_orb" },
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)

            const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
            if (dragold) {
                if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                requestMagiportService(bot, bot.S.dragold as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }

            }
        },
    },
    fireroamer: {
        attack: async (bot: Warrior, friends: Character[]) => {
            // Use bow if they're far away, use fire equipment if they're close
            const near = bot.getEntity({ type: "fireroamer", withinRange: 40 })
            if (near) warriorStrategy.fireroamer.equipment = warriorBurn
            else warriorStrategy.fireroamer.equipment = warriorBow

            await attackTheseTypesWarrior(bot, ["fireroamer"], friends, { disableAgitate: true, targetingPartyMember: true })
        },
        equipment: warriorBow,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "desertland", x: 200, y: -675 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    franky: {
        attack: async (bot: Warrior, friends: Character[]) => {
            await attackTheseTypesWarrior(bot, ["nerfedmummy", "franky"], friends, { disableAgitate: true, disableCleave: true, disableCreditCheck: true }) },
        equipment: warriorAOE,
        move: async (bot: Warrior) => {
            await goToSpecialMonster(bot, "franky", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    fvampire: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["fvampire"], friends) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            await goToSpecialMonster(bot, "fvampire", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    ghost: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["ghost"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["ghost"], { map: "halloween", x: 236, y: -1224 })
        },
    },
    goldenbat: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["goldenbat"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
    },
    goo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["goo", "rgoo", "bgoo"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["goo"], { map: "main", x: -52, y: 787 }) },
    },
    greenjr: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["greenjr", "snake", "osnake"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "greenjr", { requestMagiport: true }) },
    },
    grinch: {
        attack: async (bot: Warrior, friends: Character[]) => {
            const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
            if (grinch
                && bot.party && !bot.partyData.list.includes[grinch.target] // It's not targeting someone in our party
                && bot.canUse("scare", { ignoreEquipped: true })) {
                if (bot.canUse("taunt") && Tools.distance(grinch, bot) < bot.G.skills.taunt.range) bot.taunt(grinch.id).catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (bot.canUse("agitate") && Tools.distance(bot, grinch) < bot.G.skills.agitate.range) bot.agitate().catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            const kane = bot.players.get("Kane")
            if (kane && Tools.distance(bot, kane) < 400) {
                await attackTheseTypesWarrior(bot, ["grinch"], friends)
            } else {
                await attackTheseTypesWarrior(bot, ["grinch"], friends, { disableStomp: true })
            }
        },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                // Go to Kane when Grinch is nearing death for extra luck
                await goToNPC(bot, "citizen0")
                return
            }

            const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
            if (grinch) {
                // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                else if (Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
            } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                requestMagiportService(bot, bot.S.grinch as IPosition)
                if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                    bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(e => console.error(`[${bot.ctype}]: ${e}`)).catch(() => { /* */ })
                }
            }
        }
    },
    hen: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["hen"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "main", x: -81.5, y: -282 }).catch(() => { /* */ }) },
    },
    icegolem: {
        attack: async (bot: Warrior, friends: Character[]) => {
            const icegolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
            if (icegolem
                && bot.party && !bot.partyData.list.includes[icegolem.target] // It's not targeting someone in our party
                && bot.canUse("scare", { ignoreEquipped: true })) {
                if (bot.canUse("taunt") && Tools.distance(icegolem, bot) < bot.G.skills.taunt.range) bot.taunt(icegolem.id).catch(e => console.error(`[${bot.ctype}]: ${e}`))
                else if (bot.canUse("agitate") && Tools.distance(bot, icegolem) < bot.G.skills.agitate.range) bot.agitate().catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            await attackTheseTypesWarrior(bot, ["icegolem"], friends)
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
            if (!iceGolem) {
                if (bot.S.icegolem as ServerInfoDataLive) requestMagiportService(bot, bot.S.icegolem as IPosition)
                await bot.smartMove({ map: "winterland", x: 783, y: 277 }).catch(() => { /* */ })
            }
            if (iceGolem && !Pathfinder.canWalkPath(bot, iceGolem)) {
                // Cheat and walk across the water.
                await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true }).catch(() => { /* */ })
            } else if (iceGolem) {
                await goToNearestWalkableToMonster(bot, ["icegolem"])
            }
        },
    },
    iceroamer: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["iceroamer"], friends, { disableAgitate: true, disableCleave: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["iceroamer"], { map: "winterland", x: 1532, y: 104 })
        }
    },
    jr: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["jr"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
    },
    mechagnome: {
        attack: async (bot: Warrior, friends: Character[]) => {
            await attackTheseTypesWarrior(bot, ["mechagnome"], friends, { disableCleave: true })
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            goToNearestWalkableToMonster2(bot, ["mechagnome"], { map: "cyberland", x: 0, y: 0 })
            if (checkOnlyEveryMS("mainframe", 250)) bot.socket.emit("eval", { command: "stop" })
        }
    },
    minimush: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["minimush", "phoenix"], friends, { disableAgitate: true }) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["minimush"], { map: "halloween", x: -18, y: 631 }) },
    },
    mole: {
        attack: async (bot: Warrior, friends: Character[]) => {
            // Use bow if they're far away, use fire equipment if they're close
            const near = bot.getEntity({ type: "mole", withinRange: 40 })
            if (near) warriorStrategy.pppompom.equipment = warriorBurn
            else warriorStrategy.pppompom.equipment = warriorBow

            const priest = friends.find(value => value.ctype == "priest")

            // Agitate low level monsters that we can tank so the ranger can kill them quickly with 3shot and 5shot.
            if (bot.canUse("agitate") && Tools.distance(bot, priest) < priest.range) {
                let shouldAgitate = true
                const toAgitate = []
                for (const [, entity] of bot.entities) {
                    if (Tools.distance(bot, entity) > bot.G.skills.agitate.range) continue // Too far to agitate
                    if (entity.target == bot.name) continue // Already targeting us
                    if (entity.type !== "mole" || entity.level > 3) {
                        // Only agitate low level moles
                        shouldAgitate = false
                        break
                    }
                    toAgitate.push(entity)
                }
                if (shouldAgitate && toAgitate.length > 0) await bot.agitate()
            }

            await attackTheseTypesWarrior(bot, ["mole"], friends, { maximumTargets: 3 })
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "tunnel", x: 5, y: -329 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    mrgreen: {
        attack: async (bot: Warrior, friends: Character[]) => {
            if (bot.isPVP()) await attackTheseTypesWarrior(bot, ["mrgreen"], friends, { disableCleave: true, disableStomp: true })
            else await attackTheseTypesWarrior(bot, ["mrgreen"], friends)
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    mrpumpkin: {
        attack: async (bot: Warrior, friends: Character[]) => {
            if (bot.isPVP()) await attackTheseTypesWarrior(bot, ["mrpumpkin"], friends, { disableCleave: true, disableStomp: true })
            else await attackTheseTypesWarrior(bot, ["mrpumpkin"], friends)
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
        },
        requireCtype: "priest"
    },
    mummy: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["mummy"], friends, { maximumTargets: 3, disableAgitate: true }) },
        equipment: warriorAOE,
        move: async (bot: Warrior) => {
            let highestMummyLevel = 0
            for (const [, entity] of bot.entities) {
                if (entity.type !== "mummy") continue
                if (entity.level > highestMummyLevel) highestMummyLevel = entity.level
            }
            if (highestMummyLevel <= 1) {
                // Mummies are low level, stay and rage
                await bot.smartMove({ map: "spookytown", x: 240, y: -1130 }).catch(() => { /* */ })
            } else {
                // Stay back
                await bot.smartMove({ map: "spookytown", x: 240, y: -1115 }).catch(() => { /* */ })
            }
        },
        requireCtype: "priest"
    },
    mvampire: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["mvampire", "bat"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
    },
    nerfedmummy: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["nerfedmummy"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "franky", { requestMagiport: true }) },
    },
    oneeye: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["oneeye"], friends, { maximumTargets: 1, disableAgitate: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "level2w", x: -195, y: 0 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    osnake: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["osnake", "snake"], friends, { disableAgitate: true }) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: 347, y: -747 }) },
    },
    phoenix: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
    },
    pinkgoo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["pinkgoo", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], friends, { disableAgitate: true }) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
            if (pinkgoo) {
                const position = offsetPositionParty(pinkgoo, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        },
    },
    plantoid: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["plantoid"], friends, { maximumTargets: 1 }) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            await kiteInCircle(bot, "plantoid", { map: "desertland", x: -800, y: -400 }, bot.range)
            //goToNearestWalkableToMonster2(bot, ["plantoid"], { map: "desertland", x: -800, y: -400 })
        },
        requireCtype: "priest"
    },
    poisio: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["poisio"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["poisio"], { map: "main", x: -141, y: 1360 }) },
    },
    pppompom: {
        attack: async (bot: Warrior, friends: Character[]) => {
            // Use bow if they're far away, use fire equipment if they're close
            const near = bot.getEntity({ type: "pppompom", withinRange: 35 })
            if (near) warriorStrategy.pppompom.equipment = warriorBurn
            else warriorStrategy.pppompom.equipment = warriorBow

            return attackTheseTypesWarrior(bot, ["pppompom"], friends, { disableAgitate: true, disableCleave: true, maximumTargets: 1 })
        },
        equipment: warriorBow,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "level2n", x: 120, y: -150 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    prat: {
        attack: async (bot: Warrior, friends: Character[]) => {
            let friendTargeted = false
            for (const friend of friends) {
                if (friend && friend.id !== bot.id && friend.targets > 0) friendTargeted = true
            }
            if (friendTargeted) await attackTheseTypesWarrior(bot, ["prat"], friends, { disableAgitate: true, maximumTargets: 2, targetingPartyMember: true })
            else await attackTheseTypesWarrior(bot, ["prat"], friends, { disableAgitate: true, maximumTargets: 2, targetingPartyMember: false })
        },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "level1", x: -296, y: 541 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    rat: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["rat"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["rat"], { map: "mansion", x: 0, y: -21 }) },
    },
    rgoo: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["rgoo", "bgoo", "goo"], friends) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => {
            const rgoo = bot.getEntity({ type: "rgoo" })
            if (rgoo) {
                goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
            } else {
                await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
            }
        },
    },
    rooster: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["rooster"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "main", x: -81.5, y: -282 }).catch(() => { /* */ }) },
    },
    scorpion: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["scorpion", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["scorpion"], { map: "main", x: 1558, y: -168 }) },
    },
    skeletor: {
        attack: async (bot: Warrior, friends: Character[]) => { return await attackTheseTypesWarrior(bot, ["skeletor", "cgoo"], friends) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 360, y: -575 }) },
        requireCtype: "priest"
    },
    slenderman: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["slenderman"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "slenderman", { requestMagiport: true }) },
    },
    snake: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["snake", "osnake"], friends, { disableAgitate: true }) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["snake", "osnake"], { map: "main", x: -102, y: 1901 }) },
    },
    snowman: {
        attack: async (bot: Warrior, friends: Character[]) => {
            // Agitate bees to farm them while attacking the snowman
            if (bot.canUse("agitate")) {
                let shouldAgitate = false
                for (const entity of bot.getEntities({
                    couldGiveCredit: true,
                    targetingMe: false,
                    withinRange: bot.G.skills.agitate.range
                })) {
                    if (entity.type !== "snowman" && !warriorStrategy[entity.type]?.attackWhileIdle) {
                    // Something else is here, don't agitate
                        shouldAgitate = false
                        break
                    }
                    shouldAgitate = true
                }
                if (shouldAgitate) bot.agitate().catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
            await attackTheseTypesWarrior(bot, ["snowman"], friends, { disableStomp: true })
        },
        attackWhileIdle: true,
        equipment: { mainhand: "candycanesword", offhand: "candycanesword", orb: "jacko" },
        move: async (bot: Warrior) => {
            await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
        },
    },
    spider: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["spider", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["spider"], { map: "main", x: 928, y: -144 }) },
    },
    squig: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["squig", "squigtoad", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["squig"], { map: "main", x: -1195, y: 422 }) },
    },
    squigtoad: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["squigtoad", "squig", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["squigtoad", "squig"], { map: "main", x: -1195, y: 422 }) },
    },
    stompy: {
        attack: async (bot: Warrior, friends: Character[]) => {
            const priest = friends.find(value => value.ctype == "priest")
            const stompy = bot.getEntity({ type: "stompy" })
            if (stompy?.level > 3) {
                await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], friends, { maximumTargets: 2, disableAgitate: true })
            } else if (priest && priest.canUse("heal", { ignoreCooldown: true }) && Tools.distance(bot, priest) < priest.range) {
                await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], friends, { disableAgitate: true })
            } else {
                await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], friends, { disableAgitate: true, disableStomp: true })
            }
        },
        equipment: warriorAOE,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)

            const stompy = bot.getEntity({ type: "stompy" })
            if (!stompy) {
                await goToSpecialMonster(bot, "stompy", { requestMagiport: true })
            } else {
                await moveInCircle(bot, stompy, 20, Math.PI / 2).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        },
        requireCtype: "priest"
    },
    stoneworm: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["stoneworm"], friends, { disableAgitate: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["stoneworm"], { map: "spookytown", x: 717, y: 129 })
        },
        requireCtype: "priest"
    },
    tiger: {
        attack: async (bot: Warrior, friends: Character[]) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                if (bot.slots.offhand && bot.slots.offhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("offhand")
                if (bot.slots.mainhand && bot.slots.mainhand.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("mainhand")
                if (bot.slots.helmet && bot.slots.helmet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("helmet")
                if (bot.slots.chest && bot.slots.chest.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("chest")
                if (bot.slots.pants && bot.slots.pants.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("pants")
                if (bot.slots.shoes && bot.slots.shoes.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("shoes")
                if (bot.slots.gloves && bot.slots.gloves.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("gloves")
                if (bot.slots.orb && bot.slots.orb.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("orb")
                if (bot.slots.amulet && bot.slots.amulet.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("amulet")
                if (bot.slots.earring1 && bot.slots.earring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring1")
                if (bot.slots.earring2 && bot.slots.earring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("earring2")
                if (bot.slots.ring1 && bot.slots.ring1.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring1")
                if (bot.slots.ring2 && bot.slots.ring2.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("ring2")
                if (bot.slots.cape && bot.slots.cape.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("cape")
                if (bot.slots.belt && bot.slots.belt.l && bot.esize > 1 && bot.cc < 100) await bot.unequip("belt")
            }
            await attackTheseTypesWarrior(bot, ["tiger", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], friends, { disableAgitate: true, disableCleave: true, disableStomp: true })
        },
        attackWhileIdle: true,
        move: async (bot: Warrior) => {
            const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
            if (tiger) {
                const position = offsetPositionParty(tiger, bot)
                if (Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* */ })
                else if (!bot.smartMoving || Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* */ })
            } else {
                if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true }).catch(e => console.error(`[${bot.ctype}]: ${e}`))
            }
        }
    },
    // tinyp: {
    //     attack: async (bot: Warrior, friends: Character[]) => {
    //         const nearby = bot.getEntity({ returnNearest: true, type: "tinyp" })
    //         if (nearby) {
    //             //
    //         }
    //     },
    //     equipment: { ...armor, mainhand: "basher", orb: "jacko" },
    //     move: async (bot: Warrior) => { await goToSpecialMonster(bot, "tinyp", { requestMagiport: true }) },
    // },
    tortoise: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["tortoise", "phoenix"], friends) },
        attackWhileIdle: true,
        equipment: warriorAOE,
        move: async (bot: Warrior) => { goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1144, y: 1118 }) },
    },
    vbat: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["vbat"], friends, { disableAgitate: true }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
    },
    wabbit: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["wabbit", "arcticbee", "bat", "bbpompom", "bee", "boar", "cgoo", "crab", "cutebee", "crabx", "croc", "fvampire", "ghost", "goldenbat", "goo", "greenjr", "hen", "jr", "minimush", "mole", "mvampire", "osnake", "phoenix", "poisio", "rooster", "scorpion", "snake", "spider", "stoneworm", "stompy", "squig", "squigtoad", "tortoise", "wolf", "wolfie", "xscorpion"], friends, { disableAgitate: true }) },
        attackWhileIdle: true,
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) },
    },
    wolf: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["wolf"], friends, { maximumTargets: 2 }) },
        equipment: warriorBurn,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "winterland", x: 380, y: -2525 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    },
    wolfie: {
        attack: async (bot: Warrior, friends: Character[]) => { await attackTheseTypesWarrior(bot, ["wolfie"], friends) },
        equipment: warriorBurn,
        move: async (bot: Warrior, healer: Priest) => {
            await goToPriestIfHurt(bot, healer)
            goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -189, y: -2026 }) },
        requireCtype: "priest"
    },
    xscorpion: {
        attack: async (bot: Warrior, friends: Character[]) => { return await attackTheseTypesWarrior(bot, ["xscorpion"], friends, { maximumTargets: 3 }) },
        equipment: warriorAOE,
        move: async (bot: Warrior) => { await bot.smartMove({ map: "halloween", x: -325, y: 750 }).catch(() => { /* */ }) },
        requireCtype: "priest"
    }
}