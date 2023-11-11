export interface WclReportMetadata {
    id: string;
    title: string;
    owner: string;
    start: number;
    end: number;
    fightCount: number;
}

export interface WclReport {
    id: string;
    logVersion: number;
    gameVersion: number;
    title: string;
    owner: string;
    start: number;
    end: number;
    zone: number;
    lang: string;
    fights: WclFight[];
    friendlies: WclFriendly[];
}

export interface WclFight {
    id: number;
    boss: number;
    start_time: number;
    end_time: number;
    name: string;
    zoneId: number;
    zoneName: string;
    zoneDifficulty: number;
    difficulty: 3 | 4; //3 = normal, 4 = heroic
    kill?: boolean;
    fightPercentage?: number;
}

export interface WclFriendly {
    name: string;
    id: number;
    guid: number;
    type: string;
    server: string;
    icon: string;
    fights: { id: number }[];
}

export interface ProcessedReport {
    id: string;
    title: string;
    owner: string;
    start: number;
    end: number;
    characters: ProcessedCharacter[];
    fights: ProcessedFight[];
}

export type ProcessedFightCharacter = {
    id: number;
    name: string;
    class: string;
    spec: string;
    damageDone: number;
    healingDone: number;
    damageTaken: number;
    gearIssues: string[];
    isEngineer: boolean;
};
export interface ProcessedFight {
    id: number;
    boss: number;
    start: number;
    end: number;
    name: string;
    difficulty: "normal" | "heroic";
    kill: boolean;
    percentage: number;
    tanks: ProcessedFightCharacter[];
    healers: ProcessedFightCharacter[];
    dps: ProcessedFightCharacter[];
}

export interface ProcessedCharacter {
    name: string;
    id: number;
    class: string;
    specs: string[];
    fightsAsDps: number;
    fightsAsHealer: number;
    fightsAsTank: number;
    isEngineer: boolean;
    mainRole: "unknown" | "dps" | "healer" | "tank";
    gearIssues: string[];
}

export type WclBand = { startTime: number; endTime: number };

export interface WclAura {
    abilityIcon: string;
    bands: WclBand[];
    guid: number;
    name: string;
    totalUptime: number;
    totalUses: number;
    type: number;
}
export interface WclAuraWithBand {
    abilityIcon: string;
    guid: number;
    name: string;
    totalUptime: number;
    totalUses: number;
    type: number;
    startTime: number;
    endTime: number;
}

export interface WclConsumeData {
    prePot: number;
    fightPot: number;
    flaskPercentage: number;
    dualElixirPercentage: number;
    foodPercentage: number;
    usesElixirs: boolean;
}

export interface WclBombData {
    bombs: number;
    sappers: number;
}

export type DamageDone = Record<string, { damage: number }>;
export type ActionsPerformed = Record<string, { actions: number }>;
export type DamageTaken = Record<string, { ticks: number; total: number }>;
export type DebuffDamageTaken = Record<string, { ticks: number; stacks: number; total: number }>;
export type DebuffStacks = Record<string, { maxStacks: number; totalStacks: number }>;

export const tableNames: Record<number, AnalysisTableName[]> = {
    845: ["spikes", "coldflame"],
    846: [
        "adds",
        "mindControlTargets",
        "interrupts",
        "cc",
        "deathAndDecay",
        "ghostMelee",
        "ghostSplash",
        "decurses",
    ],
    848: ["bloodbeasts", "bloodbeastsMelee", "bloodNovaSplash"],
    849: ["vileGasSplash", "malleableGoo", "pungentBlight"],
    850: ["vileGasSplash", "spray", "explosion", "ooze"],
    851: ["redSlime", "greenSlime", "slimePuddleTaken", "malleableGoo", "gasBomb"],
    852: ["shockVortex", "empoweredShockVortex", "shadowPrison", "darkNuclei", "dispels"],
    853: ["boltSplash"],
    854: [
        "blazing",
        "suppressors",
        "columnOfFrost",
        "manaVoid",
        "acidBurst",
        "gutSpray",
        "wormMelee",
        "interrupts",
    ],
    855: ["chilledToTheBone", "instabilitySplash", /*"mysticBuffet",*/ "blisteringCold"],
    856: [
        "ragingSpirit",
        "valkyr",
        "vileSpirit",
        "shockwave",
        "soulShriek",
        "painAndSuffering",
        "defile",
        "spiritSplash",
    ],
};
export const prettyTableNames: Record<string, string> = {
    spikes: "Damage to Spikes",
    coldflame: "Coldflame Damage",
    adds: "Damage to Adds",
    mindControlTargets: "Damage to MC Targets",
    interrupts: "Interrupts",
    cc: "Cyclone, Hex and Poly",
    deathAndDecay: "Death and Decay Damage",
    ghostMelee: "Ghost Melee Damage",
    ghostSplash: "Ghost Splash Damage",
    decurses: "Decurses",
    bloodbeasts: "Damage to Bloodbeasts",
    bloodbeastsMelee: "Bloodbeast Melee Damage",
    bloodNovaSplash: "Blood Nova Splash Damage",
    vileGasSplash: "Vile Gas Splash Damage",
    malleableGoo: "Malleable Goo Damage",
    pungentBlight: "Pungent Blight Damage",
    slimePool: "Slime Pool Damage",
    spray: "Spray Damage",
    explosion: "Ooze Explosion Damage",
    ooze: "Ooze Flood Damage",
    redSlime: "Damage to Red Slime",
    greenSlime: "Damage to Green Slime",
    slimePuddleTaken: "Slime Puddle Damage Taken",
    gasBomb: "Gas Bomb Damage",
    shockVortex: "Shock Vortex Damage",
    empoweredShockVortex: "Empowered Shock Vortex Damage",
    shadowPrison: "Shadow Prison Damage",
    darkNuclei: "Damage Dark Nuclei",
    dispels: "Dispels",
    whirlSplash: "Bloodbolt Whirl Splash Damage",
    boltSplash: "Twilight Bloodbolt Splash Damage",
    blazing: "Damage to Blazing Skeletons",
    suppressors: "Damage to Suppressors",
    columnOfFrost: "Column of Frost Damage",
    manaVoid: "Mana Void Damage",
    acidBurst: "Acid Burst Damage",
    gutSpray: "Gut Spray Damage",
    wormMelee: "Worm Melee Damage",
    iceTomb: "Damage to Ice Tombs",
    chilledToTheBone: "Chilled to the Bone Damage",
    instabilitySplash: "Instability Splash Damage",
    mysticBuffet: "Mystic Buffet Stacks",
    blisteringCold: "Blistering Cold Damage",
    ragingSpirit: "Damage to Raging Spirits",
    vileSpirit: "Damage to Vile Spirits",
    valkyr: "Damage to Valkyrs",
    shockwave: "Shockwave Damage",
    soulShriek: "Soul Shriek Damage",
    painAndSuffering: "Pain and Suffering Damage",
    defile: "Defile Damage",
    spiritSplash: "Spirit Splash Damage",
};
export type AnalysisTableName =
    | "spikes" //marrowgar
    | "coldflame"
    | "adds" //LDW
    | "mindControlTargets"
    | "interrupts"
    | "cc"
    | "deathAndDecay"
    | "ghostMelee"
    | "ghostSplash"
    | "decurses"
    | "bloodbeasts" //Saurfang
    | "bloodbeastsMelee"
    | "bloodNovaSplash"
    | "vileGasSplash" //Festergut
    | "malleableGoo"
    | "pungentBlight"
    | "slimePool" //Rotface
    | "spray"
    | "explosion"
    | "ooze"
    | "redSlime" //Putricide
    | "greenSlime"
    | "slimePuddleTaken"
    | "gasBomb"
    | "malleableGoo"
    | "shockVortex" //Council
    | "empoweredShockVortex"
    | "shadowPrison"
    | "darkNuclei"
    | "dispels"
    | "whirlSplash" //Blood Queen
    | "boltSplash"
    | "blazing" //Dreamwalker
    | "suppressors"
    | "columnOfFrost"
    | "manaVoid"
    | "acidBurst"
    | "gutSpray"
    | "wormMelee"
    | "interrupts"
    | "iceTomb" //Sindragosa
    | "chilledToTheBone"
    | "instabilitySplash"
    | "mysticBuffet"
    | "blisteringCold"
    | "ragingSpirit" //Lich King
    | "valkyr"
    | "shockwave"
    | "soulShriek"
    | "painAndSuffering"
    | "defile"
    | "vileSpirit"
    | "spiritSplash";
export type AnalysisFightSelection = "all" | number;
export type WclAnalysisBaseFight = {
    fightId: "all" | number;
    processed: boolean;
    type: "unknown" | "damage-done" | "damage-taken" | "actions-performed" | "debuff-damage-taken";
};
export const bossKeysById: Record<number, string> = {
    845: "marrowgar",
    846: "deathwhisper",
    848: "saurfang",
    849: "festergut",
    850: "rotface",
    851: "putricide",
    852: "council",
    853: "bloodqueen",
    854: "dreamwalker",
    855: "sindragosa",
    856: "lichking",
};

export type WclFullAnalysisTableType =
    | DamageDone
    | DamageTaken
    | ActionsPerformed
    | DebuffDamageTaken
    | DebuffStacks;
export type WclFullAnalysisFight = WclAnalysisBaseFight & {
    tables: Record<string, WclFullAnalysisTableType>;
};
export type WclFullAnalysis = Record<number, WclFullAnalysisFight[]>;

export const isDebuffDamageTakenTable = (
    table: WclFullAnalysisTableType
): table is DebuffDamageTaken => {
    return Object.values(table)[0].stacks != null;
};
export const isDamageTakenTable = (table: WclFullAnalysisTableType): table is DamageTaken => {
    return Object.values(table)[0].ticks != null;
};
export const isDamageDoneTable = (table: WclFullAnalysisTableType): table is DamageDone => {
    return Object.values(table)[0].damage != null;
};
export const isActionsPerformedTable = (
    table: WclFullAnalysisTableType
): table is ActionsPerformed => {
    return Object.values(table)[0].actions != null;
};
export const isDebuffsTable = (table: WclFullAnalysisTableType): table is DebuffStacks => {
    return Object.values(table)[0].maxStacks != null;
};
