import { EnsureEquipped } from "../strategies/attack.js"

export const MAGE_NORMAL: EnsureEquipped = {
    amulet: { name: "t2intamulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "int" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "int" } },
    earring1: { name: "intearring", filters: { returnHighestLevel: true } },
    earring2: { name: "intearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "int" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "int" } },
    mainhand: { name: "firestaff", filters: { returnHighestLevel: true } },
    offhand: { name: "wbook0", filters: { returnHighestLevel: true } },
    orb: { name: "orbofint", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "int" } },
    ring1: { name: "intring", filters: { returnHighestLevel: true } },
    ring2: { name: "intring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "int" } }
}

export const MAGE_SPLASH: EnsureEquipped = {
    amulet: { name: "t2intamulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "int" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "int" } },
    earring1: { name: "intearring", filters: { returnHighestLevel: true } },
    earring2: { name: "intearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "int" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "int" } },
    mainhand: { name: "gstaff", filters: { returnHighestLevel: true } },
    offhand: undefined,
    orb: { name: "orbofint", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "int" } },
    ring1: { name: "intring", filters: { returnHighestLevel: true } },
    ring2: { name: "intring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "int" } }
}

export const PRIEST_NORMAL: EnsureEquipped = {
    amulet: { name: "t2intamulet", filters: { returnHighestLevel: true } },
    cape: { name: "bcape", filters: { returnHighestLevel: true, statType: "int" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "int" } },
    earring1: { name: "intearring", filters: { returnHighestLevel: true } },
    earring2: { name: "intearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "int" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "int" } },
    mainhand: { name: "pmace", filters: { returnHighestLevel: true } },
    offhand: { name: "wbook0", filters: { returnHighestLevel: true } },
    orb: { name: "orbofint", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "int" } },
    ring1: { name: "intring", filters: { returnHighestLevel: true } },
    ring2: { name: "intring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "int" } }
}

export const PRIEST_LUCK: EnsureEquipped = {
    amulet: { name: "t2intamulet", filters: { returnHighestLevel: true } },
    cape: { name: "bcape", filters: { returnHighestLevel: true, statType: "int" } },
    chest: { name: "wattire", filters: { returnHighestLevel: true, statType: "int" } },
    earring1: { name: "intearring", filters: { returnHighestLevel: true } },
    earring2: { name: "intearring", filters: { returnHighestLevel: true } },
    gloves: { name: "wgloves", filters: { returnHighestLevel: true, statType: "int" } },
    helmet: { name: "wcap", filters: { returnHighestLevel: true, statType: "int" } },
    mainhand: { name: "pmace", filters: { returnHighestLevel: true } },
    offhand: { name: "mshield", filters: { returnHighestLevel: true } },
    orb: { name: "rabbitsfoot", filters: { returnHighestLevel: true } },
    pants: { name: "wbreeches", filters: { returnHighestLevel: true, statType: "int" } },
    ring1: { name: "intring", filters: { returnHighestLevel: true } },
    ring2: { name: "intring", filters: { returnHighestLevel: true } },
    shoes: { name: "wshoes", filters: { returnHighestLevel: true, statType: "int" } }
}

export const WARRIOR_NORMAL: EnsureEquipped = {
    amulet: { name: "t2stramulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "str" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "str" } },
    earring1: { name: "strearring", filters: { returnHighestLevel: true } },
    earring2: { name: "strearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "str" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "str" } },
    mainhand: { name: "fireblade", filters: { returnHighestLevel: true } },
    offhand: { name: "fireblade", filters: { returnHighestLevel: true } },
    orb: { name: "orbofstr", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "str" } },
    ring1: { name: "strring", filters: { returnHighestLevel: true } },
    ring2: { name: "strring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "str" } }
}

export const WARRIOR_SPLASH: EnsureEquipped = {
    amulet: { name: "t2stramulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "str" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "str" } },
    earring1: { name: "strearring", filters: { returnHighestLevel: true } },
    earring2: { name: "strearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "str" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "str" } },
    mainhand: { name: "ololipop", filters: { returnHighestLevel: true } },
    offhand: { name: "glolipop", filters: { returnHighestLevel: true } },
    orb: { name: "orbofstr", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "str" } },
    ring1: { name: "strring", filters: { returnHighestLevel: true } },
    ring2: { name: "strring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "str" } }
}

export const WARRIOR_STOMP: EnsureEquipped = {
    amulet: { name: "t2stramulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "str" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "str" } },
    earring1: { name: "strearring", filters: { returnHighestLevel: true } },
    earring2: { name: "strearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "str" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "str" } },
    mainhand: { name: "basher", filters: { returnHighestLevel: true } },
    offhand: undefined,
    orb: { name: "orbofstr", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "str" } },
    ring1: { name: "strring", filters: { returnHighestLevel: true } },
    ring2: { name: "strring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "str" } }
}

export const WARRIOR_RANGED: EnsureEquipped = {
    amulet: { name: "t2stramulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "str" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "str" } },
    earring1: { name: "strearring", filters: { returnHighestLevel: true } },
    earring2: { name: "strearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "str" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "str" } },
    mainhand: { name: "t3bow", filters: { returnHighestLevel: true } },
    offhand: undefined,
    orb: { name: "orbofstr", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "str" } },
    ring1: { name: "strring", filters: { returnHighestLevel: true } },
    ring2: { name: "strring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "str" } }
}

export const RANGER_NORMAL: EnsureEquipped = {
    amulet: { name: "t2dexamulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "dex" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "dex" } },
    earring1: { name: "dexearring", filters: { returnHighestLevel: true } },
    earring2: { name: "dexearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "dex" } },
    helmet: { name: "hhelmet", filters: { returnHighestLevel: true, statType: "dex" } },
    mainhand: { name: "crossbow", filters: { returnHighestLevel: true } },
    offhand: { name: "quiver", filters: { returnHighestLevel: true } },
    orb: { name: "orbofstr", filters: { returnHighestLevel: true } },
    pants: { name: "hpants", filters: { returnHighestLevel: true, statType: "dex" } },
    ring1: { name: "dexring", filters: { returnHighestLevel: true } },
    ring2: { name: "dexring", filters: { returnHighestLevel: true } },
    shoes: { name: "hboots", filters: { returnHighestLevel: true, statType: "dex" } }
}