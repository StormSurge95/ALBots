import AL, { Merchant, Priest, Ranger, Warrior, ServerInfoDataLive, IPosition, SlotType, ItemName, Tools, Pathfinder } from "alclient"
import { addSocket, startServer } from "algui"
import { goToAggroMonster, goToNearestWalkableToMonster, goToNearestWalkableToMonster2, goToNPC, goToPriestIfHurt, goToSpecialMonster, kiteInCircle, moveInCircle, requestMagiportService, startTrackerLoop } from "../base/general"
import { caveBatsNearCrypt, caveBatsNearDoor, caveBatsSouthEast, mainCrabs, mainGoos, offsetPositionParty } from "../base/locations.js"
import { attackTheseTypesMerchant } from "../base/merchant.js"
import { partyLeader, partyMembers } from "../base/party.js"
import { attackTheseTypesPriest } from "../base/priest.js"
import { attackTheseTypesRanger } from "../base/ranger.js"
import { attackTheseTypesWarrior } from "../base/warrior.js"
import { Information, Strategy } from "../definitions/bot.js"
import { DEFAULT_IDENTIFIER, DEFAULT_REGION, startMerchant, startPriest, startRanger, startWarrior } from "./shared.js"

const TARGET_REGION = DEFAULT_REGION
const TARGET_IDENTIFIER = DEFAULT_IDENTIFIER

const information: Information = {
    friends: [undefined, undefined, undefined, undefined],
    bot1: {
        bot: undefined,
        name: "PriestSurge",
        target: undefined
    },
    bot2: {
        bot: undefined,
        name: "RangerSurge",
        target: undefined
    },
    bot3: {
        bot: undefined,
        name: "WarriorSurge",
        target: undefined
    },
    merchant: {
        bot: undefined,
        name: "StormSurge",
        target: undefined
    }
}

function prepareMerchant(bot: Merchant) {
    const strategy: Strategy = {
        bee: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["bee", "cutebee"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => { await goToNearestWalkableToMonster2(bot, ["bee", "cutebee"], mainCrabs) }
        },
        crab: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["crab"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => { await goToNearestWalkableToMonster2(bot, ["crab"], mainCrabs) }
        },
        crabxx: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["crabxx"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "crabxx" })
                if (nearest && AL.Tools.distance(bot, nearest) > 25) {
                    await bot.smartMove(nearest, { getWithin: 25 })
                } else {
                    await goToSpecialMonster(bot, "crabxx", { requestMagiport: true })
                }
            }
        },
        goo: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["goo", "rgoo", "bgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => { await goToNearestWalkableToMonster2(bot, ["goo", "rgoo", "bgoo"], mainGoos) }
        },
        hen: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["hen"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => { await goToNearestWalkableToMonster2(bot, ["hen", "rooster"]) }
        },
        rooster: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["rooster"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1", ring1: "zapper" },
            move: async () => { await goToNearestWalkableToMonster2(bot, ["hen", "rooster"]) }
        },
        snowman: {
            attack: async () => { await attackTheseTypesMerchant(bot, ["snowman"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "dartgun", offhand: "wbook1" },
            move: async () => { await goToSpecialMonster(bot, "snowman", { requestMagiport: true }) }
        }
    }
    startMerchant(bot, information, strategy, { map: "main", x: -250, y: -100 }, partyLeader, partyMembers).catch(console.error)
}

function preparePriest(bot: Priest) {
    const maxAttackSpeedEquipment: { [T in SlotType]?: ItemName } = { amulet: "intamulet", belt: "intbelt", cape: "angelwings", chest: "wattire", earring1: "cearring", earring2: "cearring", gloves: "wgloves", helmet: "wcap", mainhand: "wand", orb: "jacko", pants: "wbreeches", ring1: "zapper", ring2: "cring", shoes: "wingedboots" }
    const maxDamageEquipment: { [T in SlotType]?: ItemName } = { ...maxAttackSpeedEquipment, mainhand: "firestaff", offhand: "wbook1" }

    const bscorpionSpawn = Pathfinder.locateMonster("bscorpion")[0]

    const strategy: Strategy = {
        defaultTarget: "spider",
        a2: {
            attack: async () => { await attackTheseTypesPriest(bot, ["a2"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "a2", { requestMagiport: true }) }
        },
        arcticbee: {
            attack: async () => { await attackTheseTypesPriest(bot, ["arcticbee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 1102, y: -873 }) },
        },
        armadillo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["armadillo", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: { mainhand: "pmace", offhand: "wbook1", orb: "jacko" },
            move: async () => { await bot.smartMove({ map: "main", x: 546, y: 1846 }) },
        },
        bat: {
            attack: async () => { await attackTheseTypesPriest(bot, ["bat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove(caveBatsNearCrypt) },
        },
        bbpompom: {
            attack: async () => { await attackTheseTypesPriest(bot, ["bbpompom"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winter_cave", x: 71, y: -164 }) },
        },
        bee: {
            attack: async () => { await attackTheseTypesPriest(bot, ["bee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 152, y: 1487 }) },
        },
        bgoo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["bgoo", "rgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
                if (bot.map !== "goobrawl") await bot.smartMove("goobrawl")
                await goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
            },
        },
        bigbird: {
            attack: async () => { await attackTheseTypesPriest(bot, ["bigbird"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 1363, y: 248 }) },
        },
        boar: {
            attack: async () => { await attackTheseTypesPriest(bot, ["boar"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 40, y: -1109 }) },
        },
        booboo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["booboo"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 265, y: -605 }) },
        },
        bscorpion: {
            attack: async () => {
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

                await attackTheseTypesPriest(bot, ["bscorpion"], information.friends)
            },
            equipment: { /** We have custom equipment in the attack loop above */ },
            move: async () => { await kiteInCircle(bot, "bscorpion", bscorpionSpawn) }
        },
        cgoo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["cgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 650, y: -500 }) },
        },
        crab: {
            attack: async () => { await attackTheseTypesPriest(bot, ["crab", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1182, y: -66 }) },
        },
        crabx: {
            attack: async () => { await attackTheseTypesPriest(bot, ["crabx", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -964, y: 1762 }) },
        },
        crabxx: {
            attack: async () => {
                await attackTheseTypesPriest(bot, ["crabx"], information.friends, { disableCreditCheck: true, disableZapper: true, healStrangers: true })
                await attackTheseTypesPriest(bot, ["crabxx", "crabx"], information.friends, { disableCreditCheck: true, healStrangers: true })
            },
            attackWhileIdle: false,
            equipment: maxDamageEquipment,
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "crabxx" })
                if (nearest && Pathfinder.canWalkPath(bot, nearest)) {
                    // Move close to other crabx to damage them and get crabxx taking damage
                    await goToNearestWalkableToMonster2(bot, ["crabxx", "crabx"], nearest)
                } else {
                    await goToSpecialMonster(bot, "crabxx", { requestMagiport: true })
                }
            }
        },
        croc: {
            attack: async () => { await attackTheseTypesPriest(bot, ["croc", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 821, y: 1710 }) },
        },
        cutebee: {
            attack: async () => { await attackTheseTypesPriest(bot, ["cutebee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
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
            attack: async () => {
                const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
                if (dragold && dragold.target
                    && bot.party && !bot.partyData.list.includes[dragold.target] // It's not targeting someone in our party
                    && bot.canUse("scare", { ignoreEquipped: true })) {
                    if (bot.canUse("absorb") && AL.Tools.distance(bot, bot.players.get(dragold.target)) < bot.G.skills.absorb.range) bot.absorbSins(dragold.target).catch(console.error)
                }
                await attackTheseTypesPriest(bot, ["dragold", "bat"], information.friends, { healStrangers: true })
            },
            equipment: { ...maxDamageEquipment, offhand: "wbookhs", orb: "test_orb" },
            move: async () => {
                const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
                if (dragold) {
                    if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                    requestMagiportService(bot, bot.S.dragold as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(console.error)
                    else if (AL.Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }

                }
            },
        },
        fireroamer: {
            attack: async () => { await attackTheseTypesPriest(bot, ["fireroamer"], information.friends) },
            equipment: { ...maxDamageEquipment, offhand: "wbookhs", orb: "test_orb" },
            move: async () => { await bot.smartMove({ map: "desertland", x: 180, y: -675 }) },
        },
        franky: {
            attack: async () => { await attackTheseTypesPriest(bot, ["nerfedmummy", "franky"], information.friends, { disableCreditCheck: true, healStrangers: true }) },
            equipment: maxDamageEquipment,
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "franky" })
                if (nearest && AL.Tools.distance(bot, nearest) > 25) {
                    // Move close to Franky because other characters might help blast away mummies
                    await bot.smartMove(nearest, { getWithin: 25 })
                } else {
                    await goToSpecialMonster(bot, "franky", { requestMagiport: true })
                }
            }
        },
        frog: {
            attack: async () => { await attackTheseTypesPriest(bot, ["frog"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["frog"], { map: "main", x: -1124, y: 1118 }) },
        },
        fvampire: {
            attack: async () => { await attackTheseTypesPriest(bot, ["fvampire"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "fvampire", { requestMagiport: true }) },
        },
        ghost: {
            attack: async () => { await attackTheseTypesPriest(bot, ["ghost"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: 276, y: -1224 }) },
        },
        goldenbat: {
            attack: async () => { await attackTheseTypesPriest(bot, ["goldenbat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
        },
        goo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["goo", "rgoo", "bgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -12, y: 787 }) },
        },
        greenjr: {
            attack: async () => { await attackTheseTypesPriest(bot, ["greenjr", "snake", "osnake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "greenjr", { requestMagiport: true }) },
        },
        grinch: {
            attack: async () => {
                const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
                if (grinch && grinch.target
                    && bot.party && !bot.partyData.list.includes[grinch.target] // It's not targeting someone in our party
                    && bot.canUse("scare", { ignoreEquipped: true })) {
                    if (bot.canUse("absorb") && AL.Tools.distance(bot, bot.players.get(grinch.target)) < bot.G.skills.absorb.range) bot.absorbSins(grinch.target).catch(console.error)
                }
                await attackTheseTypesPriest(bot, ["grinch"], information.friends)
            },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => {
                if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                    // Go to Kane when Grinch is nearing death for extra luck
                    await goToNPC(bot, "citizen0")
                    return
                }

                const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
                if (grinch) {
                    // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                    if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                    if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                    requestMagiportService(bot, bot.S.grinch as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(console.error)
                    else if (AL.Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }
                }
            }
        },
        hen: {
            attack: async () => { await attackTheseTypesPriest(bot, ["hen"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -41.5, y: -282 }) },
        },
        icegolem: {
            attack: async () => { await attackTheseTypesPriest(bot, ["icegolem"], information.friends, { healStrangers: true }) },
            equipment: maxDamageEquipment,
            move: async () => {
                const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
                if (!iceGolem) {
                    if (bot.S.icegolem as ServerInfoDataLive) await requestMagiportService(bot, bot.S.icegolem as IPosition)
                    await bot.smartMove({ map: "winterland", x: 783, y: 277 })
                }
                if (iceGolem && !AL.Pathfinder.canWalkPath(bot, iceGolem)) {
                    // Cheat and walk across the water.
                    await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true })
                } else if (iceGolem) {
                    await goToNearestWalkableToMonster(bot, ["icegolem"])
                }
            },
        },
        iceroamer: {
            attack: async () => { await attackTheseTypesPriest(bot, ["iceroamer"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 1492, y: 104 }) },
        },
        jr: {
            attack: async () => { await attackTheseTypesPriest(bot, ["jr"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
        },
        minimush: {
            attack: async () => { await attackTheseTypesPriest(bot, ["minimush", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: 28, y: 631 }) },
        },
        mole: {
            attack: async () => { await attackTheseTypesPriest(bot, ["mole"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "tunnel", x: -35, y: -329 }) },
        },
        mrgreen: {
            attack: async () => { await attackTheseTypesPriest(bot, ["mrgreen"], information.friends, { healStrangers: true }) },
            equipment: maxDamageEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
            },
        },
        mrpumpkin: {
            attack: async () => { await attackTheseTypesPriest(bot, ["mrpumpkin"], information.friends, { healStrangers: true }) },
            equipment: maxDamageEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
            },
        },
        mummy: {
            attack: async () => { await attackTheseTypesPriest(bot, ["mummy"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 270, y: -1129 }) },
        },
        mvampire: {
            attack: async () => { await attackTheseTypesPriest(bot, ["mvampire", "bat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
        },
        nerfedmummy: {
            attack: async () => { await attackTheseTypesPriest(bot, ["nerfedmummy"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "franky", { requestMagiport: true }) },
        },
        oneeye: {
            attack: async () => { await attackTheseTypesPriest(bot, ["oneeye"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "level2w", x: -155, y: 0 }) },
        },
        osnake: {
            attack: async () => { await attackTheseTypesPriest(bot, ["osnake", "snake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: -488, y: -708 }) }
        },
        phoenix: {
            attack: async () => { await attackTheseTypesPriest(bot, ["phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
        },
        pinkgoo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["pinkgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => {
                const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
                if (pinkgoo) {
                    const position = offsetPositionParty(pinkgoo, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* Suppress Warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(console.error)
                }
            },
        },
        plantoid: {
            attack: async () => { await attackTheseTypesPriest(bot, ["plantoid"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: -730, y: -125 }) },
        },
        poisio: {
            attack: async () => { await attackTheseTypesPriest(bot, ["poisio"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -101, y: 1360 }) },
        },
        porcupine: {
            attack: async () => { await attackTheseTypesPriest(bot, ["porcupine"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: -809, y: 135 }) },
        },
        pppompom: {
            attack: async () => { await attackTheseTypesPriest(bot, ["pppompom"], information.friends, { targetingPartyMember: true }) },
            equipment: { mainhand: "firestaff", offhand: "lantern", orb: "jacko" },
            move: async () => { await bot.smartMove({ map: "level2n", x: 120, y: -130 }) }
        },
        prat: {
            attack: async () => { await attackTheseTypesPriest(bot, ["prat"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "level1", x: -296, y: 557 }) },
        },
        rat: {
            attack: async () => { await attackTheseTypesPriest(bot, ["rat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "mansion", x: -224, y: -313 }) },
        },
        rgoo: {
            attack: async () => { await attackTheseTypesPriest(bot, ["rgoo", "bgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => {
                const rgoo = bot.getEntity({ type: "rgoo" })
                if (rgoo) {
                    await goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
                } else {
                    await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
                }
            },
        },
        rooster: {
            attack: async () => { await attackTheseTypesPriest(bot, ["rooster"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -41.5, y: -282 }) },
        },
        scorpion: {
            attack: async () => { await attackTheseTypesPriest(bot, ["scorpion", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 1598, y: -168 }) },
        },
        skeletor: {
            attack: async () => { await attackTheseTypesPriest(bot, ["skeletor", "cgoo"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 400, y: -575 }) },
        },
        snake: {
            attack: async () => { await attackTheseTypesPriest(bot, ["snake", "osnake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -62, y: 1901 }) },
        },
        snowman: {
            attack: async () => { await attackTheseTypesPriest(bot, ["snowman"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
            }
        },
        spider: {
            attack: async () => { await attackTheseTypesPriest(bot, ["spider", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 968, y: -144 }) },
        },
        squig: {
            attack: async () => { await attackTheseTypesPriest(bot, ["squig", "squigtoad", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1155, y: 422 }) },
        },
        squigtoad: {
            attack: async () => { await attackTheseTypesPriest(bot, ["squigtoad", "squig", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1155, y: 422 }) }
        },
        stompy: {
            attack: async () => { await attackTheseTypesPriest(bot, ["stompy", "wolf", "wolfie", "boar"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "stompy", { requestMagiport: true }) }
        },
        stoneworm: {
            attack: async () => { await attackTheseTypesPriest(bot, ["stoneworm"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 697, y: 129 }) }
        },
        tinyp: {
            attack: async () => { await attackTheseTypesPriest(bot, ["tinyp"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "tinyp", { requestMagiport: true }) }
        },
        tiger: {
            attack: async () => {
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
                await attackTheseTypesPriest(bot, ["tiger"], information.friends)
            },
            attackWhileIdle: true,
            move: async () => {
                const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
                if (tiger) {
                    const position = offsetPositionParty(tiger, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /** Suppress warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true })
                }
            }
        },
        tortoise: {
            attack: async () => { await attackTheseTypesPriest(bot, ["tortoise", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1104, y: 1118 }) },
        },
        vbat: {
            attack: async () => { await attackTheseTypesPriest(bot, ["vbat"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
        },
        wabbit: {
            attack: async () => { await attackTheseTypesPriest(bot, ["wabbit"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) },
        },
        wolf: {
            attack: async () => { await attackTheseTypesPriest(bot, ["wolf"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 420, y: -2525 }) },
        },
        wolfie: {
            attack: async () => { await attackTheseTypesPriest(bot, ["wolfie"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -149, y: -2026 }) },
        },
        xscorpion: {
            attack: async () => { await attackTheseTypesPriest(bot, ["xscorpion"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: -325, y: 725 }) },
        }
    }
    startPriest(bot, information, strategy, partyLeader, partyMembers).catch(console.error)
}

function prepareRanger(bot: Ranger) {
    const bscorpionSpawn = Pathfinder.locateMonster("bscorpion")[0]
    const maxCritEquipment: { [T in SlotType]?: ItemName } = { amulet: "dexamulet", belt: "dexbelt", cape: "bcape", chest: "wattire", earring1: "dexearring", earring2: "dexearring", gloves: "wgloves", helmet: "fury", mainhand: "crossbow", offhand: "t2quiver", orb: "orbofdex", pants: "wbreeches", ring1: "zapper", ring2: "cring", shoes: "wingedboots" }
    const maxRangeEquipment: { [T in SlotType]?: ItemName } = { ...maxCritEquipment, helmet: "cyber", offhand: "quiver" }
    const maxDamageEquipment: { [T in SlotType]?: ItemName } = { ...maxCritEquipment, helmet: "cyber", mainhand: "firebow" }
    const maxAttackSpeedEquipment: { [T in SlotType]?: ItemName } = { ...maxCritEquipment, helmet: "cyber", mainhand: "hbow" }

    const strategy: Strategy = {
        defaultTarget: "spider",
        a2: {
            attack: async () => { await attackTheseTypesRanger(bot, ["a2"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "a2", { requestMagiport: true }) }
        },
        arcticbee: {
            attack: async () => { await attackTheseTypesRanger(bot, ["arcticbee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 1082, y: -873 }) },
        },
        armadillo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["armadillo", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 526, y: 1846 }) },
        },
        bat: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove(caveBatsNearDoor) },
        },
        bbpompom: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bbpompom"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "winter_cave", x: 51, y: -164 }) },
        },
        bee: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 494, y: 1101 }) },
        },
        bgoo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bgoo", "rgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
                if (bot.map !== "goobrawl") await bot.smartMove("goobrawl")
                await goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
            },
        },
        bigbird: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bigbird"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 1343, y: 248 }) },
        },
        boar: {
            attack: async () => { await attackTheseTypesRanger(bot, ["boar"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 20, y: -1109 }) },
        },
        booboo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["booboo"], information.friends) },
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 265, y: -645 }) },
        },
        bscorpion: {
            attack: async () => { await attackTheseTypesRanger(bot, ["bscorpion"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await kiteInCircle(bot, "bscorpion", bscorpionSpawn) },
            requireCtype: "priest"
        },
        cgoo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["cgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 0, y: -500 }) },
        },
        crab: {
            attack: async () => { await attackTheseTypesRanger(bot, ["crab", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1202, y: -66 }) },
        },
        crabx: {
            attack: async () => { await attackTheseTypesRanger(bot, ["crabx", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -1202, y: -66 }) },
        },
        crabxx: {
            attack: async () => {
                await attackTheseTypesRanger(bot, ["crabx"], information.friends, { disableCreditCheck: true, disableZapper: true })
                await attackTheseTypesRanger(bot, ["crabxx", "crabx"], information.friends, { disableCreditCheck: true })
            },
            attackWhileIdle: false,
            equipment: maxDamageEquipment,
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "crabxx" })
                if (nearest && Pathfinder.canWalkPath(bot, nearest)) {
                    // Move close to other crabx to damage them and get crabxx taking damage
                    await goToNearestWalkableToMonster2(bot, ["crabxx", "crabx"], nearest)
                } else {
                    await goToSpecialMonster(bot, "crabxx", { requestMagiport: true })
                }
            }
        },
        croc: {
            attack: async () => { await attackTheseTypesRanger(bot, ["croc", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 801, y: 1710 }) },
        },
        cutebee: {
            attack: async () => { await attackTheseTypesRanger(bot, ["cutebee"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
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
            attack: async () => { await attackTheseTypesRanger(bot, ["dragold", "bat"], information.friends) },
            equipment: { chest: "harmor", gloves: "hgloves", helmet: "cyber", mainhand: "firebow", offhand: "t2quiver", orb: "test_orb", pants: "hpants", shoes: "wingedboots" },
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)

                const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
                if (dragold) {
                    if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                    requestMagiportService(bot, bot.S.dragold as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(console.error)
                    else if (AL.Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }

                }
            },
            requireCtype: "priest"
        },
        fireroamer: {
            attack: async () => { await attackTheseTypesRanger(bot, ["fireroamer"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: 160, y: -675 }) },
            requireCtype: "priest"
        },
        franky: {
            attack: async () => { await attackTheseTypesRanger(bot, ["nerfedmummy", "franky"], information.friends, { disableCreditCheck: true }) },
            equipment: maxDamageEquipment,
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "franky" })
                if (nearest && AL.Tools.distance(bot, nearest) > 25) {
                    // Move close to Franky because other characters might help blast away mummies
                    await bot.smartMove(nearest, { getWithin: 25 })
                } else {
                    await goToSpecialMonster(bot, "franky", { requestMagiport: true })
                }
            },
            requireCtype: "priest"
        },
        fvampire: {
            attack: async () => { await attackTheseTypesRanger(bot, ["fvampire", "ghost"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "fvampire", { requestMagiport: true }) },
            requireCtype: "priest"
        },
        ghost: {
            attack: async () => { await attackTheseTypesRanger(bot, ["ghost"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: 256, y: -1224 }) }
        },
        goldenbat: {
            attack: async () => { await attackTheseTypesRanger(bot, ["goldenbat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
        },
        goo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["goo", "rgoo", "bgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -32, y: 787 }) },
        },
        greenjr: {
            attack: async () => { await attackTheseTypesRanger(bot, ["greenjr", "snake", "osnake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove("greenjr") },
        },
        grinch: {
            attack: async () => { await attackTheseTypesRanger(bot, ["grinch"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => {
                if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                    // Go to Kane when Grinch is nearing death for extra luck
                    await goToNPC(bot, "citizen0")
                    return
                }

                const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
                if (grinch) {
                    // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                    if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                    if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                    requestMagiportService(bot, bot.S.grinch as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(console.error)
                    else if (AL.Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }
                }
            }
        },
        hen: {
            attack: async () => { await attackTheseTypesRanger(bot, ["hen"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -61.5, y: -282 }) },
        },
        icegolem: {
            attack: async () => { await attackTheseTypesRanger(bot, ["icegolem"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => {
                const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
                if (!iceGolem) {
                    if (bot.S.icegolem as ServerInfoDataLive) requestMagiportService(bot, bot.S.icegolem as IPosition)
                    await bot.smartMove({ map: "winterland", x: 783, y: 277 })
                }
                if (iceGolem && !AL.Pathfinder.canWalkPath(bot, iceGolem)) {
                    // Cheat and walk across the water.
                    await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true })
                } else if (iceGolem) {
                    await goToNearestWalkableToMonster(bot, ["icegolem"])
                }
            },
        },
        iceroamer: {
            attack: async () => { await attackTheseTypesRanger(bot, ["iceroamer"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 1512, y: 104 }) },
        },
        jr: {
            attack: async () => { await attackTheseTypesRanger(bot, ["jr"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
        },
        minimush: {
            attack: async () => { await attackTheseTypesRanger(bot, ["minimush", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: 8, y: 631 }) },
        },
        mole: {
            attack: async () => { await attackTheseTypesRanger(bot, ["mole"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "tunnel", x: -15, y: -329 }) },
            requireCtype: "priest"
        },
        mrgreen: {
            attack: async () => { await attackTheseTypesRanger(bot, ["mrgreen"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        mrpumpkin: {
            attack: async () => { await attackTheseTypesRanger(bot, ["mrpumpkin"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        mummy: {
            attack: async () => { await attackTheseTypesRanger(bot, ["mummy"], information.friends) },
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 250, y: -1129 }) },
            requireCtype: "priest"
        },
        mvampire: {
            attack: async () => { await attackTheseTypesRanger(bot, ["mvampire", "bat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
        },
        nerfedmummy: {
            attack: async () => { await attackTheseTypesRanger(bot, ["nerfedmummy"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove("franky") },
        },
        oneeye: {
            attack: async () => { await attackTheseTypesRanger(bot, ["oneeye"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "level2w", x: -175, y: 0 }) },
            requireCtype: "priest",
        },
        osnake: {
            attack: async () => { await attackTheseTypesRanger(bot, ["osnake", "snake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: -589, y: -335 }) }
        },
        phoenix: {
            attack: async () => { await attackTheseTypesRanger(bot, ["phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
        },
        pinkgoo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["pinkgoo", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
                const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
                if (pinkgoo) {
                    const position = offsetPositionParty(pinkgoo, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* Suppress Warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(console.error)
                }
            },
        },
        plantoid: {
            attack: async () => { await attackTheseTypesRanger(bot, ["plantoid"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: -750, y: -125 }) },
            requireCtype: "priest"
        },
        poisio: {
            // TODO: If we can 1shot with hbow, use that instead
            attack: async () => { await attackTheseTypesRanger(bot, ["poisio"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -121, y: 1360 }) },
        },
        porcupine: {
            attack: async () => { await attackTheseTypesRanger(bot, ["porcupine"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: -829, y: 135 }) },
        },
        pppompom: {
            attack: async () => { await attackTheseTypesRanger(bot, ["pppompom"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "level2n", x: 120, y: -170 }) },
            requireCtype: "priest"
        },
        prat: {
            attack: async () => { await attackTheseTypesRanger(bot, ["prat"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "level1", x: -280, y: 541 }) },
            requireCtype: "priest"
        },
        rat: {
            // TODO: Optimize positioning
            attack: async () => { await attackTheseTypesRanger(bot, ["rat"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "mansion", x: 100, y: -225 }) },
        },
        rgoo: {
            attack: async () => { await attackTheseTypesRanger(bot, ["rgoo", "bgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => {
                const rgoo = bot.getEntity({ type: "rgoo" })
                if (rgoo) {
                    await goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
                } else {
                    await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
                }
            },
        },
        rooster: {
            attack: async () => { await attackTheseTypesRanger(bot, ["rooster"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -61.5, y: -282 }) },
        },
        scorpion: {
            attack: async () => { await attackTheseTypesRanger(bot, ["scorpion", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 1578, y: -168 }) },
        },
        skeletor: {
            attack: async () => { await attackTheseTypesRanger(bot, ["skeletor", "cgoo"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 380, y: -575 }) },
            requireCtype: "priest",
        },
        slenderman: {
            attack: async () => { await attackTheseTypesRanger(bot, ["slenderman"], information.friends) },
            attackWhileIdle: true,
            equipment: maxCritEquipment,
            move: async () => { await goToSpecialMonster(bot, "slenderman", { requestMagiport: true }) }
        },
        snake: {
            attack: async () => { await attackTheseTypesRanger(bot, ["snake", "osnake"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -82, y: 1901 }) },
        },
        snowman: {
            attack: async () => { await attackTheseTypesRanger(bot, ["snowman", "arcticbee", "boar", "wolf", "wolfie"], information.friends) },
            attackWhileIdle: true,
            equipment: maxAttackSpeedEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
            },
        },
        spider: {
            attack: async () => { await attackTheseTypesRanger(bot, ["spider", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 948, y: -144 }) },
        },
        squig: {
            attack: async () => { await attackTheseTypesRanger(bot, ["squig", "squigtoad", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1175, y: 422 }) },
        },
        squigtoad: {
            attack: async () => { await attackTheseTypesRanger(bot, ["squigtoad", "squig", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -1175, y: 422 }) },
        },
        stompy: {
            attack: async () => { await attackTheseTypesRanger(bot, ["stompy", "wolf", "wolfie", "boar"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "stompy", { requestMagiport: true }) },
            requireCtype: "priest"
        },
        stoneworm: {
            attack: async () => { await attackTheseTypesRanger(bot, ["stoneworm"], information.friends) },
            equipment: maxRangeEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 677, y: 129 }) },
            requireCtype: "priest"
        },
        tinyp: {
            attack: async () => {
                const tinyp = bot.getEntity({ returnNearest: true, type: "tinyp" })
                if (tinyp && Tools.distance(bot, tinyp) < bot.range * bot.G.skills.supershot.range_multiplier) {
                    await bot.superShot(tinyp.id)
                }
                await attackTheseTypesRanger(bot, ["minimush", "osnake", "snake"], information.friends, { disableHuntersMark: true, disableSupershot: true })
                return
            },
            equipment: maxCritEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "tinyp", { requestMagiport: true })
            }
        },
        tiger: {
            attack: async () => {
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
                await attackTheseTypesRanger(bot, ["tiger", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], information.friends)
            },
            attackWhileIdle: true,
            move: async () => {
                const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
                if (tiger) {
                    const position = offsetPositionParty(tiger, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* Suppress Warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true }).catch(console.error)
                }
            }
        },
        tortoise: {
            attack: async () => { await attackTheseTypesRanger(bot, ["tortoise", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1124, y: 1118 }) },
        },
        vbat: {
            attack: async () => { await attackTheseTypesRanger(bot, ["vbat"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
        },
        wabbit: {
            attack: async () => { await attackTheseTypesRanger(bot, ["wabbit", "arcticbee", "bat", "bbpompom", "bee", "boar", "cgoo", "crab", "cutebee", "crabx", "croc", "fvampire", "ghost", "goldenbat", "goo", "greenjr", "hen", "jr", "minimush", "mole", "mvampire", "osnake", "phoenix", "poisio", "rooster", "scorpion", "snake", "spider", "stoneworm", "stompy", "squig", "squigtoad", "tortoise", "wolf", "wolfie", "xscorpion"], information.friends) },
            attackWhileIdle: true,
            equipment: maxRangeEquipment,
            move: async () => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) }
        },
        wolf: {
            attack: async () => { await attackTheseTypesRanger(bot, ["wolf"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 400, y: -2525 }) },
            requireCtype: "priest"
        },
        wolfie: {
            attack: async () => { await attackTheseTypesRanger(bot, ["wolfie"], information.friends) },
            equipment: maxDamageEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -169, y: -2026 }) },
            requireCtype: "priest"
        },
        xscorpion: {
            attack: async () => { await attackTheseTypesRanger(bot, ["xscorpion"], information.friends, { targetingPartyMember: true }) },
            equipment: maxDamageEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: -325, y: 775 }) },
            requireCtype: "priest"
        }
    }
    startRanger(bot, information, strategy, partyLeader, partyMembers).catch(console.error)
}

function prepareWarrior(bot: Warrior) {
    const armor: { [T in SlotType]?: ItemName } = { amulet: "snring", belt: "strbelt", cape: "bcape", chest: "harmor", earring1: "cearring", earring2: "cearring", gloves: "hgloves", helmet: "hhelmet", orb: "orbofstr", pants: "hpants", ring1: "zapper", ring2: "strring", shoes: "wingedboots" }
    const aoeEquipment: { [T in SlotType]?: ItemName } = { ...armor, mainhand: "vhammer", offhand: "glolipop" }
    const burnEquipment: { [T in SlotType]?: ItemName } = { ...armor, mainhand: "fireblade", offhand: "fireblade" }
    const bowEquipment: { [T in SlotType]?: ItemName } = { ...armor, mainhand: "hbow", offhand: undefined }
    const bscorpionSpawn = Pathfinder.locateMonster("bscorpion")[0]
    const strategy: Strategy = {
        defaultTarget: "spider",
        a2: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["vbat"], information.friends, { disableAgitate: true }) },
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
        },
        arcticbee: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["arcticbee"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["arcticbee"], { map: "winterland", x: 1062, y: -873 }) },
        },
        bat: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bat"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["bat"], caveBatsSouthEast) },
        },
        bbpompom: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bbpompom"], information.friends, { disableAgitate: true }) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["bbpompom"], { map: "winter_cave", x: 31, y: -164 })
            },
        },
        bee: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bee"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["bee"], { map: "main", x: 737, y: 720 }) },
        },
        bgoo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bgoo", "rgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
                if (bot.map !== "goobrawl") await bot.smartMove("goobrawl")
                await goToNearestWalkableToMonster2(bot, ["bgoo", "rgoo", "goo"])
            },
        },
        bigbird: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bigbird"], information.friends) },
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: 1323, y: 248 }) },
            requireCtype: "priest",
        },
        boar: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["boar"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 0, y: -1109 }) },
            requireCtype: "priest"
        },
        booboo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["booboo"], information.friends, { maximumTargets: 1 }) },
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "spookytown", x: 265, y: -625 }) },
            requireCtype: "priest"
        },
        bscorpion: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["bscorpion"], information.friends, { disableAgitate: true, targetingPartyMember: true }) },
            equipment: burnEquipment,
            move: async () => {
                const nearest = bot.getEntity({ returnNearest: true, type: "bscorpion" })
                if (nearest && nearest.target && nearest.couldGiveCreditForKill(bot)) {
                    await goToNearestWalkableToMonster2(bot, ["bscorpion"], bscorpionSpawn)
                } else {
                    await kiteInCircle(bot, "bscorpion", bscorpionSpawn)
                }
            },
            requireCtype: "priest"
        },
        cgoo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["cgoo"], information.friends) },
            equipment: aoeEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["cgoo"], { map: "arena", x: 151.6, y: 40.82 })
            },
        },
        crab: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["crab", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["crab"], { map: "main", x: -1222, y: -66 }) },
        },
        crabx: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["crabx", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["crabx"], { map: "main", x: -1004, y: 1762 }) },
        },
        crabxx: {
            attack: async () => {
                await attackTheseTypesWarrior(bot, ["crabx"], information.friends, { disableCreditCheck: true, disableZapper: true })
                await attackTheseTypesWarrior(bot, ["crabxx", "crabx"], information.friends, { disableCreditCheck: true })
            },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            requireCtype: "priest",
            move: async () => { await goToSpecialMonster(bot, "crabxx", { requestMagiport: true }) },
        },
        croc: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["croc", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["croc"], { map: "main", x: 781, y: 1710 }) },
        },
        cutebee: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["cutebee", "bee", "crab", "croc", "goo", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
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
            attack: async () => {
                const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
                const priest = bot.players.get(information.bot1.name)
                if (dragold
                    && bot.party && !bot.partyData.list.includes[dragold.target] // It's not targeting someone in our party
                    && priest && AL.Tools.distance(bot, priest) < priest.range
                    && bot.canUse("scare", { ignoreEquipped: true })) {
                    if (bot.canUse("taunt") && AL.Tools.distance(dragold, bot) < bot.G.skills.taunt.range) bot.taunt(dragold.id).catch(console.error)
                    else if (bot.canUse("agitate") && AL.Tools.distance(bot, dragold) < bot.G.skills.agitate.range) bot.agitate().catch(console.error)
                }
                await attackTheseTypesWarrior(bot, ["dragold", "bat"], information.friends)
            },
            equipment: { ...aoeEquipment, orb: "test_orb" },
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)

                const dragold = bot.getEntity({ returnNearest: true, type: "dragold" })
                if (dragold) {
                    if (!bot.smartMoving) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(dragold, bot.smartMoving) > 100) bot.smartMove(dragold, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.dragold as ServerInfoDataLive)?.live) {
                    requestMagiportService(bot, bot.S.dragold as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "dragold").catch(console.error)
                    else if (AL.Tools.distance(bot.S.dragold as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.dragold as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }

                }
            },
        },
        fireroamer: {
            attack: async () => {
                // Use bow if they're far away, use fire equipment if they're close
                const near = bot.getEntity({ type: "fireroamer", withinRange: 40 })
                if (near) strategy.fireroamer.equipment = burnEquipment
                else strategy.fireroamer.equipment = bowEquipment

                await attackTheseTypesWarrior(bot, ["fireroamer"], information.friends, { disableAgitate: true, targetingPartyMember: true })
            },
            equipment: bowEquipment,
            move: async () => { await bot.smartMove({ map: "desertland", x: 200, y: -675 }) },
            requireCtype: "priest"
        },
        franky: {
            attack: async () => {
                // NOTE: Disabling taunt until we have logic to move to the corner.
                // const franky = bot.getEntity({ returnNearest: true, type: "franky" })
                // const priest = bot.players.get(information.bot1.name)
                // if (franky
                //     && bot.party && !bot.partyData.list.includes[franky.target] // It's not targeting someone in our party
                //     && priest && AL.Tools.distance(bot, priest) < priest.range
                //     && bot.canUse("scare", { ignoreEquipped: true })) {
                //     if (bot.canUse("taunt") && AL.Tools.distance(franky, bot) < bot.G.skills.taunt.range) bot.taunt(franky.id)
                // }
                await attackTheseTypesWarrior(bot, ["nerfedmummy", "franky"], information.friends, { disableAgitate: true, disableCleave: true, disableCreditCheck: true }) },
            equipment: aoeEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "franky", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        fvampire: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["fvampire"], information.friends) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToSpecialMonster(bot, "fvampire", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        ghost: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["ghost"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["ghost"], { map: "halloween", x: 236, y: -1224 })
            },
        },
        goldenbat: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["goldenbat"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToSpecialMonster(bot, "goldenbat", { requestMagiport: true }) },
        },
        goo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["goo", "rgoo", "bgoo"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["goo"], { map: "main", x: -52, y: 787 }) },
        },
        greenjr: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["greenjr", "snake", "osnake"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "greenjr", { requestMagiport: true }) },
        },
        grinch: {
            attack: async () => {
                const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
                if (grinch
                    && bot.party && !bot.partyData.list.includes[grinch.target] // It's not targeting someone in our party
                    && bot.canUse("scare", { ignoreEquipped: true })) {
                    if (bot.canUse("taunt") && AL.Tools.distance(grinch, bot) < bot.G.skills.taunt.range) bot.taunt(grinch.id).catch(console.error)
                    else if (bot.canUse("agitate") && AL.Tools.distance(bot, grinch) < bot.G.skills.agitate.range) bot.agitate().catch(console.error)
                }
                const kane = bot.players.get("Kane")
                if (kane && AL.Tools.distance(bot, kane) < 400) {
                    await attackTheseTypesWarrior(bot, ["grinch"], information.friends)
                } else {
                    await attackTheseTypesWarrior(bot, ["grinch"], information.friends, { disableStomp: true })
                }
            },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
                if ((bot.S.grinch as ServerInfoDataLive)?.live && (bot.S.grinch as ServerInfoDataLive).hp <= 1_000_000) {
                    // Go to Kane when Grinch is nearing death for extra luck
                    await goToNPC(bot, "citizen0")
                    return
                }

                const grinch = bot.getEntity({ returnNearest: true, type: "grinch" })
                if (grinch) {
                    // TODO: If we see Kane, and the grinch is targeting us, kite him to Kane
                    if (!bot.smartMoving) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    else if (AL.Tools.distance(grinch, bot.smartMoving) > 100) bot.smartMove(grinch, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                } else if ((bot.S.grinch as ServerInfoDataLive)?.live) {
                    if (["woffice", "bank", "bank_b", "bank_u"].includes((bot.S.grinch as ServerInfoDataLive).map)) return // Wait for the grinch to move to a place we can attack him

                    requestMagiportService(bot, bot.S.grinch as IPosition)
                    if (!bot.smartMoving) goToSpecialMonster(bot, "grinch").catch(console.error)
                    else if (AL.Tools.distance(bot.S.grinch as IPosition, bot.smartMoving) > 100) {
                        bot.smartMove(bot.S.grinch as IPosition, { getWithin: Math.min(bot.range - 10, 50) }).catch(console.error)
                    }
                }
            }
        },
        hen: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["hen"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -81.5, y: -282 }) },
        },
        icegolem: {
            attack: async () => {
                const icegolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
                if (icegolem
                    && bot.party && !bot.partyData.list.includes[icegolem.target] // It's not targeting someone in our party
                    && bot.canUse("scare", { ignoreEquipped: true })) {
                    if (bot.canUse("taunt") && AL.Tools.distance(icegolem, bot) < bot.G.skills.taunt.range) bot.taunt(icegolem.id).catch(console.error)
                    else if (bot.canUse("agitate") && AL.Tools.distance(bot, icegolem) < bot.G.skills.agitate.range) bot.agitate().catch(console.error)
                }
                await attackTheseTypesWarrior(bot, ["icegolem"], information.friends)
            },
            equipment: burnEquipment,
            move: async () => {
                const iceGolem = bot.getEntity({ returnNearest: true, type: "icegolem" })
                if (!iceGolem) {
                    if (bot.S.icegolem as ServerInfoDataLive) requestMagiportService(bot, bot.S.icegolem as IPosition)
                    await bot.smartMove({ map: "winterland", x: 783, y: 277 })
                }
                if (iceGolem && !AL.Pathfinder.canWalkPath(bot, iceGolem)) {
                    // Cheat and walk across the water.
                    await bot.move(iceGolem.x, iceGolem.y, { disableSafetyCheck: true })
                } else if (iceGolem) {
                    await goToNearestWalkableToMonster(bot, ["icegolem"])
                }
            },
        },
        iceroamer: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["iceroamer"], information.friends, { disableAgitate: true, disableCleave: true }) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["iceroamer"], { map: "winterland", x: 1532, y: 104 })
            }
        },
        jr: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["jr"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "jr", { requestMagiport: true }) },
        },
        minimush: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["minimush", "phoenix"], information.friends, { disableAgitate: true }) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["minimush"], { map: "halloween", x: -18, y: 631 }) },
        },
        mole: {
            attack: async () => {
                // Use bow if they're far away, use fire equipment if they're close
                const near = bot.getEntity({ type: "mole", withinRange: 40 })
                if (near) strategy.pppompom.equipment = burnEquipment
                else strategy.pppompom.equipment = bowEquipment

                // Agitate low level monsters that we can tank so the ranger can kill them quickly with 3shot and 5shot.
                if (bot.canUse("agitate") && Tools.distance(bot, information.bot1?.bot) < information.bot1?.bot?.range) {
                    let shouldAgitate = true
                    const toAgitate = []
                    for (const [, entity] of bot.entities) {
                        if (AL.Tools.distance(bot, entity) > bot.G.skills.agitate.range) continue // Too far to agitate
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

                await attackTheseTypesWarrior(bot, ["mole"], information.friends, { maximumTargets: 3 })
            },
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "tunnel", x: 5, y: -329 }) },
            requireCtype: "priest"
        },
        mrgreen: {
            attack: async () => {
                if (bot.isPVP()) await attackTheseTypesWarrior(bot, ["mrgreen"], information.friends, { disableCleave: true, disableStomp: true })
                else await attackTheseTypesWarrior(bot, ["mrgreen"], information.friends)
            },
            equipment: burnEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrgreen", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        mrpumpkin: {
            attack: async () => {
                if (bot.isPVP()) await attackTheseTypesWarrior(bot, ["mrpumpkin"], information.friends, { disableCleave: true, disableStomp: true })
                else await attackTheseTypesWarrior(bot, ["mrpumpkin"], information.friends)
            },
            equipment: burnEquipment,
            move: async () => {
                await goToSpecialMonster(bot, "mrpumpkin", { requestMagiport: true })
            },
            requireCtype: "priest"
        },
        mummy: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["mummy"], information.friends, { maximumTargets: 3 }) },
            equipment: aoeEquipment,
            move: async () => {
                let highestMummyLevel = 0
                for (const [, entity] of bot.entities) {
                    if (entity.type !== "mummy") continue
                    if (entity.level > highestMummyLevel) highestMummyLevel = entity.level
                }
                if (highestMummyLevel <= 1) {
                    // Mummies are low level, stay and rage
                    await bot.smartMove({ map: "spookytown", x: 230, y: -1131 }).catch(() => { /* Suppress errors */ })
                } else {
                    // Stay back
                    await bot.smartMove({ map: "spookytown", x: 230, y: -1129 }).catch(() => { /* Suppress errors */ })
                }
            },
            requireCtype: "priest"
        },
        mvampire: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["mvampire", "bat"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "mvampire", { requestMagiport: true }) },
        },
        nerfedmummy: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["nerfedmummy"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "franky", { requestMagiport: true }) },
        },
        oneeye: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["oneeye"], information.friends, { maximumTargets: 1 }) },
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "level2w", x: -195, y: 0 }) },
            requireCtype: "priest"
        },
        osnake: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["osnake", "snake"], information.friends, { disableAgitate: true }) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["osnake", "snake"], { map: "halloween", x: 347, y: -747 }) },
        },
        phoenix: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "phoenix", { requestMagiport: true }) },
        },
        pinkgoo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["pinkgoo", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], information.friends, { disableAgitate: true }) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
                const pinkgoo = bot.getEntity({ returnNearest: true, type: "pinkgoo" })
                if (pinkgoo) {
                    const position = offsetPositionParty(pinkgoo, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* Suppress Warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "pinkgoo", { requestMagiport: true }).catch(console.error)
                }
            },
        },
        plantoid: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["plantoid"], information.friends, { maximumTargets: 1 }) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["plantoid"], { map: "desertland", x: -770, y: -125 })
            },
            requireCtype: "priest"
        },
        poisio: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["poisio"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["poisio"], { map: "main", x: -141, y: 1360 }) },
        },
        pppompom: {
            attack: async () => {
                // Use bow if they're far away, use fire equipment if they're close
                const near = bot.getEntity({ type: "pppompom", withinRange: 40 })
                if (near) strategy.pppompom.equipment = burnEquipment
                else strategy.pppompom.equipment = bowEquipment

                return attackTheseTypesWarrior(bot, ["pppompom"], information.friends, { disableAgitate: true, disableCleave: true, maximumTargets: 1 })
            },
            equipment: bowEquipment,
            move: async () => { await bot.smartMove({ map: "level2n", x: 120, y: -150 }) },
            requireCtype: "priest"
        },
        rat: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["rat"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["rat"], { map: "mansion", x: 0, y: -21 }) },
        },
        rgoo: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["rgoo", "bgoo", "goo"], information.friends) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => {
                const rgoo = bot.getEntity({ type: "rgoo" })
                if (rgoo) {
                    await goToNearestWalkableToMonster2(bot, ["rgoo", "bgoo", "goo"])
                } else {
                    await goToSpecialMonster(bot, "rgoo", { requestMagiport: true })
                }
            },
        },
        rooster: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["rooster"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await bot.smartMove({ map: "main", x: -81.5, y: -282 }) },
        },
        scorpion: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["scorpion", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["scorpion"], { map: "main", x: 1558, y: -168 }) },
        },
        skeletor: {
            attack: async () => { return await attackTheseTypesWarrior(bot, ["skeletor", "cgoo"], information.friends) },
            equipment: burnEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["skeletor"], { map: "arena", x: 360, y: -575 }) },
            requireCtype: "priest"
        },
        slenderman: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["slenderman"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToSpecialMonster(bot, "slenderman", { requestMagiport: true }) },
        },
        snake: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["snake", "osnake"], information.friends, { disableAgitate: true }) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["snake", "osnake"], { map: "main", x: -102, y: 1901 }) },
        },
        snowman: {
            attack: async () => {
                // Agitate bees to farm them while attacking the snowman
                if (bot.canUse("agitate")) {
                    let shouldAgitate = false
                    for (const entity of bot.getEntities({
                        couldGiveCredit: true,
                        targetingMe: false,
                        withinRange: bot.G.skills.agitate.range
                    })) {
                        if (entity.type !== "snowman" && !strategy[entity.type]?.attackWhileIdle) {
                        // Something else is here, don't agitate
                            shouldAgitate = false
                            break
                        }
                        shouldAgitate = true
                    }
                    if (shouldAgitate) bot.agitate().catch(console.error)
                }
                await attackTheseTypesWarrior(bot, ["snowman"], information.friends, { disableStomp: true })
            },
            attackWhileIdle: true,
            equipment: { mainhand: "candycanesword", offhand: "candycanesword", orb: "jacko" },
            move: async () => {
                await goToSpecialMonster(bot, "snowman", { requestMagiport: true })
            },
        },
        spider: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["spider", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["spider"], { map: "main", x: 928, y: -144 }) },
        },
        squig: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["squig", "squigtoad", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["squig"], { map: "main", x: -1195, y: 422 }) },
        },
        squigtoad: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["squigtoad", "squig", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["squigtoad", "squig"], { map: "main", x: -1195, y: 422 }) },
        },
        stompy: {
            attack: async () => {
                const priest = information.bot1.bot
                const stompy = bot.getEntity({ type: "stompy" })
                if (stompy?.level > 3) {
                    await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], information.friends, { maximumTargets: 2 })
                } else if (priest && priest.canUse("heal", { ignoreCooldown: true }) && AL.Tools.distance(bot, priest) < priest.range) {
                    await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], information.friends, { disableStomp: true })
                } else {
                    await attackTheseTypesWarrior(bot, ["stompy", "wolf", "wolfie", "boar"], information.friends, { disableAgitate: true, disableStomp: true })
                }
            },
            equipment: aoeEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)

                const stompy = bot.getEntity({ type: "stompy" })
                if (!stompy) {
                    await goToSpecialMonster(bot, "stompy", { requestMagiport: true })
                } else {
                    moveInCircle(bot, stompy, 20, Math.PI / 2).catch(console.error)
                }
            },
            requireCtype: "priest"
        },
        stoneworm: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["stoneworm"], information.friends, { disableAgitate: true }) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["stoneworm"], { map: "spookytown", x: 717, y: 129 })
            },
            requireCtype: "priest"
        },
        tiger: {
            attack: async () => {
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
                await attackTheseTypesWarrior(bot, ["tiger", "arcticbee", "bat", "bbpompom", "bee", "boar", "crab", "cutebee", "crabx", "croc", "goldenbat", "goo", "minimush", "osnake", "poisio", "scorpion", "snake", "spider", "squig", "squigtoad", "tortoise", "wolf", "wolfie"], information.friends, { disableAgitate: true, disableCleave: true, disableStomp: true })
            },
            attackWhileIdle: true,
            move: async () => {
                const tiger = bot.getEntity({ returnNearest: true, type: "tiger" })
                if (tiger) {
                    const position = offsetPositionParty(tiger, bot)
                    if (AL.Pathfinder.canWalkPath(bot, position)) bot.move(position.x, position.y).catch(() => { /* Suppress Warnings */ })
                    else if (!bot.smartMoving || AL.Tools.distance(position, bot.smartMoving) > 100) bot.smartMove(position).catch(() => { /* Suppress Warnings */ })
                } else {
                    if (!bot.smartMoving) goToSpecialMonster(bot, "tiger", { requestMagiport: true }).catch(console.error)
                }
            }
        },
        tinyp: {
            attack: async () => {
                const nearby = bot.getEntity({ returnNearest: true, type: "tinyp" })
                if (nearby) {
                    if (!nearby.s.stunned && bot.canUse("stomp") && AL.Tools.distance(bot, nearby) < bot.range) {
                        // Stun before attacking
                        await bot.stomp()
                    } else if (nearby.s.stunned) {
                        await attackTheseTypesWarrior(bot, ["tinyp"], information.friends, { disableAgitate: true })
                    }
                }
            },
            equipment: { ...armor, mainhand: "basher", orb: "jacko" },
            move: async () => { await goToSpecialMonster(bot, "tinyp", { requestMagiport: true }) },
        },
        tortoise: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["tortoise", "phoenix"], information.friends) },
            attackWhileIdle: true,
            equipment: aoeEquipment,
            move: async () => { await goToNearestWalkableToMonster2(bot, ["tortoise"], { map: "main", x: -1144, y: 1118 }) },
        },
        vbat: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["vbat"], information.friends, { disableAgitate: true }) },
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "vbat", { requestMagiport: true }) },
        },
        wabbit: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["wabbit", "arcticbee", "bat", "bbpompom", "bee", "boar", "cgoo", "crab", "cutebee", "crabx", "croc", "fvampire", "ghost", "goldenbat", "goo", "greenjr", "hen", "jr", "minimush", "mole", "mvampire", "osnake", "phoenix", "poisio", "rooster", "scorpion", "snake", "spider", "stoneworm", "stompy", "squig", "squigtoad", "tortoise", "wolf", "wolfie", "xscorpion"], information.friends, { disableAgitate: true }) },
            attackWhileIdle: true,
            equipment: burnEquipment,
            move: async () => { await goToSpecialMonster(bot, "wabbit", { requestMagiport: true }) },
        },
        wolf: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["wolf"], information.friends, { maximumTargets: 2 }) },
            equipment: burnEquipment,
            move: async () => { await bot.smartMove({ map: "winterland", x: 380, y: -2525 }) },
            requireCtype: "priest"
        },
        wolfie: {
            attack: async () => { await attackTheseTypesWarrior(bot, ["wolfie"], information.friends) },
            equipment: burnEquipment,
            move: async () => {
                await goToPriestIfHurt(bot, information.bot1.bot)
                await goToNearestWalkableToMonster2(bot, ["wolfie"], { map: "winterland", x: -189, y: -2026 }) },
            requireCtype: "priest"
        },
        xscorpion: {
            attack: async () => { return await attackTheseTypesWarrior(bot, ["xscorpion"], information.friends, { maximumTargets: 3 }) },
            equipment: aoeEquipment,
            move: async () => { await bot.smartMove({ map: "halloween", x: -325, y: 750 }) },
            requireCtype: "priest"
        }
    }
    startWarrior(bot, information, strategy, partyLeader, partyMembers).catch(console.error)
}

async function run() {
    // Login and prepare pathfinding
    await Promise.all([AL.Game.loginJSONFile("./credentials.json"), AL.Game.getGData(true, false)])
    await AL.Pathfinder.prepare(AL.Game.G)

    // Start all characters
    console.log("Connecting...")

    // Start GUI
    startServer(8080, AL.Game.G)

    const startMerchantLoop = async () => {
        // Start the characters
        const loopBot = async () => {
            try {
                if (information.merchant.bot) information.merchant.bot.disconnect()
                information.merchant.bot = await AL.Game.startMerchant(information.merchant.name, TARGET_REGION, TARGET_IDENTIFIER)
                information.friends[0] = information.merchant.bot
                prepareMerchant(information.merchant.bot)
                startTrackerLoop(information.merchant.bot)
                addSocket(information.merchant.bot.id, information.merchant.bot.socket, information.merchant.bot)
                information.merchant.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(e)
                if (information.merchant.bot) information.merchant.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    startMerchantLoop().catch(() => { /* ignore errors */ })

    const startPriestLoop = async () => {
        // Start the characters
        const loopBot = async () => {
            try {
                if (information.bot1.bot) information.bot1.bot.disconnect()
                information.bot1.bot = await AL.Game.startPriest(information.bot1.name, TARGET_REGION, TARGET_IDENTIFIER)
                information.friends[1] = information.bot1.bot
                preparePriest(information.bot1.bot as Priest)
                addSocket(information.bot1.bot.id, information.bot1.bot.socket, information.bot1.bot)
                information.bot1.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(e)
                if (information.bot1.bot) information.bot1.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    startPriestLoop().catch(() => { /* ignore errors */ })

    const startRangerLoop = async () => {
        // Start the characters
        const loopBot = async () => {
            try {
                if (information.bot2.bot) information.bot2.bot.disconnect()
                information.bot2.bot = await AL.Game.startRanger(information.bot2.name, TARGET_REGION, TARGET_IDENTIFIER)
                information.friends[2] = information.bot2.bot
                prepareRanger(information.bot2.bot as Ranger)
                startTrackerLoop(information.bot2.bot)
                addSocket(information.bot2.bot.id, information.bot2.bot.socket, information.bot2.bot)
                information.bot2.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(e)
                if (information.bot2.bot) information.bot2.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    startRangerLoop().catch(() => { /* ignore errors */ })

    const startWarriorLoop = async () => {
        // Start the characters
        const loopBot = async () => {
            try {
                if (information.bot3.bot) information.bot3.bot.disconnect()
                information.bot3.bot = await AL.Game.startWarrior(information.bot3.name, TARGET_REGION, TARGET_IDENTIFIER)
                information.friends[3] = information.bot3.bot
                prepareWarrior(information.bot3.bot as Warrior)
                addSocket(information.bot3.bot.id, information.bot3.bot.socket, information.bot3.bot)
                information.bot3.bot.socket.on("disconnect", loopBot)
            } catch (e) {
                console.error(e)
                if (information.bot3.bot) information.bot3.bot.disconnect()
                const wait = /wait_(\d+)_second/.exec(e)
                if (wait && wait[1]) setTimeout(loopBot, 1000 + Number.parseInt(wait[1]) * 1000)
                else if (/limits/.test(e)) setTimeout(loopBot, AL.Constants.RECONNECT_TIMEOUT_MS)
                else if (/ingame/.test(e)) setTimeout(loopBot, 500)
                else setTimeout(loopBot, 10000)
            }
        }
        loopBot().catch(console.error)
    }
    startWarriorLoop().catch(() => { /* ignore errors */ })
}
run().catch(console.error)