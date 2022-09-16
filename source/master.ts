import { Mage, MonsterName, Paladin, Priest, Ranger, Rogue, Warrior } from "../../ALClient/build/index.js"
import { startMage, startPaladin, startPriest, startRanger, startRogue, startWarrior } from "./base/shared.js"
import { Information } from "./definitions/bot.js"
import { mageStrategy, paladinStrategy, priestStrategy, rangerStrategy, rogueStrategy, warriorStrategy } from "./strategies.js"

export function prepareMage(bot: Mage, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    mageStrategy.defaultTarget = options.defaultTarget
    mageStrategy.monsterhunt = options.monsterhunt

    startMage(bot, mageStrategy, information, partyLeader, partyMembers)
}

export function preparePaladin(bot: Paladin, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    paladinStrategy.defaultTarget = options.defaultTarget
    paladinStrategy.monsterhunt = options.monsterhunt

    startPaladin(bot, paladinStrategy, information, partyLeader, partyMembers).catch(console.error)
}

export function preparePriest(bot: Priest, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    priestStrategy.defaultTarget = options.defaultTarget
    priestStrategy.monsterhunt = options.monsterhunt

    startPriest(bot, priestStrategy, information, partyLeader, partyMembers).catch(console.error)
}

export function prepareRanger(bot: Ranger, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    rangerStrategy.defaultTarget = options.defaultTarget
    rangerStrategy.monsterhunt = options.monsterhunt

    startRanger(bot, rangerStrategy, information, partyLeader, partyMembers).catch(console.error)
}

export function prepareRogue(bot: Rogue, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    rogueStrategy.defaultTarget = options.defaultTarget
    rogueStrategy.monsterhunt = options.monsterhunt

    startRogue(bot, rogueStrategy, information, partyLeader, partyMembers).catch(console.error)
}

export function prepareWarrior(bot: Warrior, information: Information, partyLeader: string, partyMembers: string[], options: { monsterhunt?: boolean, defaultTarget?: MonsterName } = {}) {
    if (!options.monsterhunt) options.monsterhunt = false
    if (!options.defaultTarget) options.defaultTarget = "spider"
    warriorStrategy.defaultTarget = options.defaultTarget
    warriorStrategy.monsterhunt = options.monsterhunt

    startWarrior(bot, warriorStrategy, information, partyLeader, partyMembers).catch(console.error)
}