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
    id: number, 
    name: string, 
    class: string, 
    spec: string, 
    damageDone: number, 
    healingDone: number, 
    damageTaken: number, 
    gearIssues: string[], 
    isEngineer: boolean
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

export type WclBand = { startTime: number, endTime: number };

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
    prePot: number,
    fightPot: number,
    flaskPercentage: number,
    dualElixirPercentage: number,
    foodPercentage: number,
    usesElixirs: boolean,
}

export interface WclBombData {
    bombs: number;
    sappers: number;
}

export type DamageDone = Record<string, number>;
export type ActionsPerformed = Record<string, number>;
export type DamageTaken = Record<string, {count: number, total: number}>;
export type DebuffDamageTaken = Record<string, {ticks: number, stacks: number, total: number}>;

export const tableNames: Record<number, AnalysisTableName[]> = {
    845: ["spikes", "coldflame"],
    846: ["adds", /*"mindControlTargets",*/ "interrupts", /*"cc",*/ "deathAndDecay", "ghostMelee", "ghostSplash"],
    848: ["bloodbeasts", "bloodbeastsMelee", "bloodNovaSplash"],
    849: ["vileGasSplash", "malleableGoo", "pungentBlight"],
    850: ["vileGasSplash", "spray", "explosion", "ooze"],
    851: ["redSlime", "greenSlime", "slimePuddleTaken", "malleableGoo", "gasBomb"],
    852: ["shockVortex", "empoweredShockVortex", "shadowPrison", "darkNuclei"],
    853: ["boltSplash"],
    854: ["blazing", "suppressors", "columnOfFrost", "manaVoid", "acidBurst", "gutSpray", "wormMelee", "interrupts"],
    855: ["chilledToTheBone", "instabilitySplash", "arcaneBuffet", "blisteringCold"],
    856: ["ragingSpirit", "valkyr", "vileSpirit", "shockwave", "soulShriek", "painAndSuffering", "defile", "spiritSplash"],
}
export const prettyTableNames: Record<string, string> = {
    spikes: "Damage to Spikes",
    coldflame: "Coldflame Damage",
    adds: "Damage to Adds",
    mindControlTargets: "Damage to MC Targets",
    interrupts: "Interrupts",
    cc: "Crowd Control",
    deathAndDecay: "Death and Decay Damage",
    ghostMelee: "Ghost Melee Damage",
    ghostSplash: "Ghost Splash Damage",
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
    arcaneBuffet: "Arcane Buffet Damage",
    blisteringCold: "Blistering Cold Damage",
    ragingSpirit: "Damage to Raging Spirits",
    valkyr: "Damage to Valkyrs",
    shockwave: "Shockwave Damage",
    soulShriek: "Soul Shriek Damage",
    painAndSuffering: "Pain and Suffering Damage",
    defile: "Defile Damage",
    ragingSpirits: "Damage to Raging Spirits",
    spiritSplash: "Spirit Splash Damage",
}
export type AnalysisTableName = 
    "spikes" | "coldflame" |
    "adds" | "mindControlTargets" | "interrupts" | "cc" | "deathAndDecay" | "ghostMelee" | "ghostSplash" |
    "bloodbeasts" | "bloodbeastsMelee" | "bloodNovaSplash" |
    "vileGasSplash" | "malleableGoo" | "pungentBlight" |
    "slimePool" | "spray" | "explosion" | "ooze" |
    "redSlime" | "greenSlime" | "slimePuddleTaken" | "gasBomb" | "malleableGoo" |
    "shockVortex" | "empoweredShockVortex" | "shadowPrison" | "darkNuclei" |
    "whirlSplash" | "boltSplash" |
    "blazing" | "suppressors" | "columnOfFrost" | "manaVoid" | "acidBurst" | "gutSpray" | "wormMelee" | "interrupts" |
    "iceTomb" | "chilledToTheBone" | "instabilitySplash" | "arcaneBuffet" | "blisteringCold" |
    "ragingSpirit" | "valkyr" | "shockwave" | "soulShriek" | "painAndSuffering" | "defile" | "vileSpirit" | "spiritSplash";
export type AnalysisFightSelection = "all" | number;
export type WclAnalysisBaseFight = {
    fightId: "all" | number;
    processed: boolean;
}
export interface WclFullAnalysis {
    marrowgar: (WclAnalysisBaseFight & {
        spikes: DamageDone;
        coldflame: DamageTaken;
    })[],
    deathwhisper: (WclAnalysisBaseFight & {
        adds: DamageDone;
        mindControlTargets: DamageDone;
        interrupts: ActionsPerformed;
        cc: ActionsPerformed;
        deathAndDecay: DamageTaken;
        ghostMelee: DamageTaken;
        ghostSplash: DamageTaken;
    })[],
    saurfang: (WclAnalysisBaseFight & {
        bloodbeasts: DamageDone;
        bloodbeastsMelee: DamageTaken;
        bloodNovaSplash: DamageTaken;
    })[],
    festergut: (WclAnalysisBaseFight & {
        vileGasSplash: DamageTaken;
        malleableGoo: DamageTaken;
        pungentBlight: DamageTaken;
    })[],
    rotface: (WclAnalysisBaseFight & {
        spray: DamageTaken;
        explosion: DamageTaken;
        ooze: DamageTaken;
        vileGasSplash: DamageTaken;
    })[],
    putricide: (WclAnalysisBaseFight & {
        redSlime: DamageDone;
        greenSlime: DamageDone;
        slimePuddleTaken: DamageTaken;
        malleableGoo: DamageTaken;
        gasBomb: DamageTaken;
    })[],
    council: (WclAnalysisBaseFight & {
        shockVortex: DamageTaken;
        empoweredShockVortex: DamageTaken;
        shadowPrison: DebuffDamageTaken;
        darkNuclei: DamageDone;
    })[],
    bloodqueen: (WclAnalysisBaseFight & {
        boltSplash: DamageTaken;
    })[],
    dreamwalker: (WclAnalysisBaseFight & {
        blazing: DamageDone;
        suppressors: DamageDone;
        interrupts: ActionsPerformed;
        columnOfFrost: DamageTaken;
        manaVoid: DamageTaken;
        acidBurst: DamageTaken;
        gutSpray: DamageTaken;
        wormMelee: DamageTaken;
    })[],
    sindragosa: (WclAnalysisBaseFight & {
        chilledToTheBone: DebuffDamageTaken;
        instabilitySplash: DamageTaken;
        arcaneBuffet: DebuffDamageTaken;
        blisteringCold: DamageTaken;
    })[],
    lichking: (WclAnalysisBaseFight & {
        ragingSpirit: DamageDone;
        valkyr: DamageDone;
        vileSpirit: DamageDone;
        shockwave: DamageTaken;
        soulShriek: DamageTaken;
        painAndSuffering: DebuffDamageTaken;
        defile: DamageTaken;
        spiritSplash: DamageTaken;
    })[],
}