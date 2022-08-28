import { Character, IPosition, MonsterName } from "alclient"

// Main
export const mainFishingSpot: IPosition = { map: "main", x: -1198, y: -288 }

// Bank
export const bankingPosition: IPosition = { map: "bank", x: 0, y: -200 }

// Crypt
export const batCaveCryptEntrance: IPosition = { map: "cave", x: -193.41, y: -1295.83 }
export const cryptWaitingSpot: IPosition = { map: "crypt", x: 100, y: 50 }
export const cryptEnd: IPosition = { map: "crypt", x: 2689.64, y: 505.06 }

// Mines
export const miningSpotM1: IPosition = { map: "tunnel", x: -280, y: -10 }
export const miningSpotM2: IPosition = { map: "woffice", x: -155, y: -175 }

export const locations: { [T in MonsterName]?: IPosition[] } = {
    arcticbee: [
        { map: "winterland", x: 1082, y: -873 }
    ],
    armadillo: [
        { map: "main", x: 526, y: 1846 }
    ],
    bat: [
        { map: "cave", x: -210, y: -480 }
    ],
    bbpompom: [
        { map: "winter_cave", x: -82.5, y: -949 },
        { map: "winter_cave", x: 51, y: -164 }
    ],
    bee: [
        { map: "main", x: 546, y: 1059 },
        { map: "main", x: 625, y: 725 },
        { map: "main", x: 152, y: 1487 }
    ],
    bigbird: [
        { map: "main", x: 1343, y: 248 }
    ],
    boar: [
        { map: "winterland", x: 15, y: -1109 }
    ],
    booboo: [
        { map: "spookytown", x: 415, y: -700 }
    ],
    cgoo: [
        { map: "level4", x: -235, y: -275 },
        { map: "level2s", x: 25, y: 500 },
        { map: "arena", x: 385, y: -420 }
    ],
    crab: [
        { map: "main", x: -1202.5, y: -66 }
    ],
    crabx: [
        { map: "main", x: -984, y: 1762 }
    ],
    croc: [
        { map: "main", x: 801, y: 1710 }
    ],
    fireroamer: [
        { map: "desertland", x: 245, y: -825 }
    ],
    frog: [
        { map: "main", x: -1124.5, y: 1118 }
    ],
    ghost: [
        { map: "halloween", x: 236, y: -1220 }
    ],
    goo: [
        { map: "main", x: -64, y: 787 }
    ],
    iceroamer: [
        { map: "winterland", x: 1512, y: 104 }
    ],
    minimush: [
        { map: "halloween", x: 10, y: 630 }
    ],
    mole: [
        { map: "tunnel", x: -15, y: -330 },
        { map: "tunnel", x: 15, y: -1075 }
    ],
    mummy: [
        { map: "level3", x: -345, y: -230 },
        { map: "level4", x: 250, y: 165 },
        { map: "spookytown", x: 255, y: -1430 }
    ],
    oneeye: [
        { map: "level2w", x: -325, y: 165 }
    ],
    osnake: [
        { map: "halloween", x: -560, y: -520 }
    ],
    poisio: [
        { map: "main", x: -121, y: 1360 }
    ],
    porcupine: [
        { map: "desertland", x: -829, y: 135 }
    ],
    prat: [
        { map: "level1", x: -120, y: 700 },
        { map: "level1", x: 25, y: 100 }
    ],
    rat: [
        { map: "mansion", x: 0, y: -170 }
    ],
    scorpion: [
        { map: "desertland", x: 390.675, y: -1422.46 },
        { map: "main", x: 1550, y: -168 }
    ],
    snake: [
        { map: "main", x: -82, y: 1901 },
        { map: "halloween", x: -560, y: -520 }
    ],
    spider: [
        { map: "main", x: 948, y: -144 }
    ],
    squig: [
        { map: "main", x: -1175.5, y: 422 }
    ],
    squigtoad: [
        { map: "main", x: -1175.5, y: 422 }
    ],
    stoneworm: [
        { map: "spookytown", x: 676, y: 129 }
    ],
    tortoise: [
        { map: "main", x: -1124.5, y: 1118 }
    ],
    wolf: [
        { map: "winterland", x: 435, y: -2745 }
    ],
    wolfie: [
        { map: "winterland", x: -75, y: -2085 }
    ]
}

export function offsetPosition(position: IPosition, x: number, y: number): IPosition {
    return { in: position.in, map: position.map, x: position.x + x, y: position.y + y }
}

export function offsetPositionParty(position: IPosition, bot: Character, offsetAmount = 10): IPosition {
    const offset = { x: 0, y: 0 }
    if (bot.party) {
        switch (bot.partyData?.list?.indexOf(bot.id)) {
            case 1:
                offset.x = offsetAmount
                break
            case 2:
                offset.x = -offsetAmount
                break
            case 3:
                offset.y = offsetAmount
                break
            case 4:
                offset.y = -offsetAmount
                break
            case 5:
                offset.x = offsetAmount
                offset.y = offsetAmount
                break
            case 6:
                offset.x = offsetAmount
                offset.y = -offsetAmount
                break
            case 7:
                offset.x = -offsetAmount
                offset.y = offsetAmount
                break
            case 8:
                offset.x = -offsetAmount
                offset.y = -offsetAmount
                break
            case 9:
                offset.x = 2 * offsetAmount
                break
        }
    }
    return { in: position.in, map: position.map, x: position.x + offset.x, y: position.y + offset.y }
}