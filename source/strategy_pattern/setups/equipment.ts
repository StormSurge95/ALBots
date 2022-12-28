import { EnsureEquipped } from "../strategies/attack.js"

export const MAGE_ARMOR: EnsureEquipped = {
    amulet: { name: "t2intamulet", filters: { returnHighestLevel: true } },
    cape: { name: "cape", filters: { returnHighestLevel: true, statType: "int" } },
    chest: { name: "harmor", filters: { returnHighestLevel: true, statType: "int" } },
    earring1: { name: "intearring", filters: { returnHighestLevel: true } },
    earring2: { name: "intearring", filters: { returnHighestLevel: true } },
    gloves: { name: "hgloves", filters: { returnHighestLevel: true, statType: "int" } },
    helmet: undefined,
    mainhand: undefined,
    offhand: undefined,
    orb: undefined,
    pants: undefined,
    ring1: undefined,
    ring2: undefined,
    shoes: undefined
}

export const PRIEST_ARMOR: EnsureEquipped = {
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