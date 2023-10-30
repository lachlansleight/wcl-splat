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

export interface ProcessedCharacter {
    name: string;
    class: string;
    specs: string[];
    fightsAsDps: number;
    fightsAsHealer: number;
    fightsAsTank: number;
    mainRole: "unknown" | "dps" | "healer" | "tank";
    gearIssues: string[];
}

export interface ProcessedFight {
    id: number;
    boss: number;
    start: number;
    end: number;
    name: string;
    difficulty: "normal" | "heroic";
    kill: boolean;
    percentage: number;
    tanks: {name: string, class: string, spec: string, damageDone: number, healingDone: number, damageTaken: number, gearIssues: string[]}[];
    healers: {name: string, class: string, spec: string, damageDone: number, healingDone: number, damageTaken: number, gearIssues: string[]}[];
    dps: {name: string, class: string, spec: string, damageDone: number, healingDone: number, damageTaken: number, gearIssues: string[]}[];
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
}