import axios from "axios";
import {
    ActionsPerformed,
    AnalysisTableName,
    DamageDone,
    DamageTaken,
    DebuffStacks,
    ProcessedCharacter,
    ProcessedFight,
    ProcessedReport,
    WclAura,
    WclAuraWithBand,
    WclBand,
    WclBombData,
    WclConsumeData,
    WclFight,
    WclFriendly,
    WclReport,
    tableNames,
} from "./WclTypes";
//import { socketsByItemId } from "./socketsByItemId";
//import GemUtils from "./gems";

class WCL {
    private static baseUrl = "https://classic.warcraftlogs.com:443/v1";

    private static getTableUrl(apiKey: string, reportId: string, table: string) {
        return `${this.baseUrl}/report/tables/${table}/${reportId}?api_key=${apiKey}`;
    }
    private static getEventsUrl(apiKey: string, reportId: string, eventType: string) {
        return `${this.baseUrl}/report/events/${eventType}/${reportId}?api_key=${apiKey}`;
    }

    static async getLog(apiKey: string, reportId: string): Promise<WclReport> {
        if (!apiKey) throw new Error("No API key provided");
        const report = (await axios(`${this.baseUrl}/report/fights/${reportId}?api_key=${apiKey}`))
            .data;
        delete report.enemies;
        delete report.enemyPets;
        delete report.exportedCharacters;
        delete report.friendlyPets;
        delete report.phases;
        const fights = report.fights.filter(
            (f: WclFight) => f.boss > 0 && f.zoneName === "Icecrown Citadel"
        );
        const friendlies = report.friendlies.filter((f: WclFriendly) => {
            if (f.type === "Pet") return false;
            if (f.type === "Unknown") return false;
            if (f.type === "NPC") return false;
            if (f.type === "Boss") return false;
            if (f.fights.length < fights.length / 2) return false;
            return true;
        });
        return {
            ...report,
            id: reportId,
            fights,
            friendlies,
        };
    }

    static async getProcessedFight(
        apiKey: string,
        reportId: string,
        rawFight: WclFight
    ): Promise<ProcessedFight> {
        if (!apiKey) throw new Error("No API key provided");
        const summary = (
            await axios(
                `${this.getTableUrl(apiKey, reportId, "summary")}&start=${
                    rawFight.start_time
                }&end=${rawFight.end_time}`
            )
        ).data;
        const getPlayerData = (player: any) => {
            return {
                id: player.id,
                name: player.name,
                class: player.type,
                spec: player.specs?.length ? player.specs[0] : "Unknown",
                damageDone: summary.damageDone.find((d: any) => d.name === player.name)?.total || 0,
                healingDone:
                    summary.healingDone.find((d: any) => d.name === player.name)?.total || 0,
                gearIssues: [], //this.getGearIssues(player.combatantInfo.gear),
                isEngineer: this.getIsEngineer(player.combatantInfo.gear),
            };
        };
        const processedFight: ProcessedFight = {
            id: rawFight.id,
            boss: rawFight.boss,
            start: rawFight.start_time,
            end: rawFight.end_time,
            name: rawFight.name,
            difficulty: rawFight.difficulty === 4 ? "heroic" : "normal",
            kill: rawFight.kill || false,
            percentage: rawFight.kill ? 0 : rawFight.fightPercentage || 0,
            tanks: summary.playerDetails?.tanks.map(getPlayerData) || [],
            healers: summary.playerDetails?.healers.map(getPlayerData) || [],
            dps: summary.playerDetails?.dps.map(getPlayerData) || [],
        };
        return processedFight;
    }

    // static getGearIssues(gear: any) {
    //     if(!gear) return ["No gear found"];
    //     let redCount = 0;
    //     let yellowCount = 0;
    //     let blueCount = 0;
    //     let nonEpicCount = 0;
    //     let metaId: number | null = null;
    //     const issues: any[] = [];
    //     gear.forEach((item: any) => {
    //         const sockets = socketsByItemId[item.id.toString()];
    //         if(!sockets) return;
    //         const enchantId = item.permanentEnchant || null;
    //         const enchantValid = GemUtils.getEnchantValid(enchantId);
    //         if(!enchantValid) issues.push("Invalid enchant on " + item.name + ": " + enchantId);
    //         if((item.gems?.length || 0) < sockets) {
    //             issues.push("Missing gems on " + item.name);
    //         }
    //         if(!item.gems) return;
    //         item.gems.forEach((gem: any) => {
    //             switch(gem.icon) {
    //                 case "inv_jewelcrafting_gem_37.jpg":
    //                 case "inv_jewelcrafting_dragonseye05.jpg":
    //                     redCount++;
    //                     break;
    //                 case "inv_jewelcrafting_gem_38.jpg":
    //                 case "inv_jewelcrafting_dragonseye03.jpg":
    //                     yellowCount++;
    //                     break;
    //                 case "inv_jewelcrafting_gem_42.jpg":
    //                 case "inv_jewelcrafting_dragonseye04.jpg":
    //                     blueCount++;
    //                     break;
    //                 case "inv_jewelcrafting_gem_41.jpg":
    //                     blueCount++;
    //                     yellowCount++;
    //                     break;
    //                 case "inv_jewelcrafting_gem_39.jpg":
    //                     redCount++;
    //                     yellowCount++;
    //                     break;
    //                 case "inv_jewelcrafting_gem_40.jpg":
    //                     redCount++;
    //                     blueCount++;
    //                     break;
    //                 case "inv_jewelcrafting_icediamond_02.jpg":
    //                 case "inv_jewelcrafting_shadowspirit_02.jpg":
    //                 case "inv_misc_gem_diamond_07.jpg":
    //                     metaId = gem.id;
    //                     break;
    //                 case "inv_misc_gem_pearl_12.jpg":
    //                     redCount++;
    //                     blueCount++;
    //                     yellowCount++;
    //                     break;
    //                 default:
    //                     nonEpicCount++;
    //                     issues.push("Bad gem on " + item.name + ": " + gem.id);
    //             }
    //         })
    //     })
    // }

    static getIsEngineer(gear: any) {
        if (!gear) return false;
        const engineeringEnchants = [3605, 3601, 3859, 3599, 3603, 3604, 3860, 3606, 3878];
        for (let i = 0; i < gear.length; i++) {
            if (
                gear[i].permanentEnchant &&
                engineeringEnchants.includes(gear[i].permanentEnchant)
            ) {
                return true;
            }
        }
        return false;
    }

    private static boundsContains(
        boundsStart: number,
        boundsEnd: number,
        spanStart: number,
        spanEnd: number
    ) {
        if (spanStart < boundsStart && spanEnd < boundsStart) return false;
        if (spanStart > boundsEnd && spanEnd > boundsEnd) return false;
        return true;
    }

    static async getConsumeInfo(apiKey: string, report: ProcessedReport, playerName?: string) {
        if (!apiKey) throw new Error("No API key provided");
        const consumesByCharacter: Record<
            string,
            {
                prepot: number;
                fightPos: number;
                flaskElixirPercentage: number;
            }
        > = {};
        report.characters.forEach(
            f =>
                (consumesByCharacter[f.name] = {
                    prepot: 0,
                    fightPos: 0,
                    flaskElixirPercentage: 0,
                })
        );
        const fightStart = report.fights[0].start;
        const fightEnd = report.fights.slice(-1)[0].end;
        const foodBuffs = [
            57358, 57325, 57334, 57356, 57329, 57327, 57332, 57360, 57367, 57365, 57371, 57399,
        ];
        const flasks = [53760, 53755, 53758, 62380, 54212];
        const elixirs = [
            53749, 60346, 53747, 60347, 53746, 33721, 60343, 53741, 28497, 53748, 53764,
        ];
        const potions = [53908, 53909, 53762];
        const prepotExcludedFights = [847, 854];
        const allData: Record<string, WclAuraWithBand[]> = {};
        for (let i = 0; i < report.characters.length; i++) {
            if (playerName && report.characters[i].name !== playerName) continue;
            const f = report.characters[i];
            const buffsUrl = `${this.getTableUrl(
                apiKey,
                report.id,
                "buffs"
            )}&start=${fightStart}&end=${fightEnd}&sourceid=${f.id}`;
            console.log("Fetching consume data for " + f.name);
            const buffsData = (await axios(buffsUrl)).data;
            const spreadBuffsData: WclAuraWithBand[] = [];
            buffsData.auras.forEach((a: WclAura) => {
                a.bands.forEach((b: WclBand) => {
                    const band: any = { ...a, startTime: b.startTime, endTime: b.endTime };
                    delete band.bands;
                    spreadBuffsData.push(band);
                });
            });
            allData[f.name] = spreadBuffsData;
        }

        const consumeData: Record<string, WclConsumeData> = {};
        const totalFightDuration = report.fights.reduce(
            (acc, cur) => acc + (cur.end - cur.start),
            0
        );
        Object.keys(allData).forEach(name => {
            consumeData[name] = {
                prePot: 0,
                fightPot: 0,
                flaskPercentage: 0,
                dualElixirPercentage: 0,
                foodPercentage: 0,
                usesElixirs: false,
            };
            const foodAuras = allData[name].filter(a => foodBuffs.includes(a.guid));
            const flaskAuras = allData[name].filter(a => flasks.includes(a.guid));
            const elixirAuras = allData[name].filter(a => elixirs.includes(a.guid));
            const potionAuras = allData[name].filter(a => potions.includes(a.guid));
            report.fights.forEach(fight => {
                const fightStart = fight.start;
                const fightEnd = fight.end;
                const fightPercentage = (fightEnd - fightStart) / totalFightDuration;
                const fightFood = foodAuras.filter(a =>
                    this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime)
                );
                const fightFlask = flaskAuras.filter(a =>
                    this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime)
                );
                const fightElixir = elixirAuras.filter(a =>
                    this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime)
                );
                const fightPotion = potionAuras.filter(a =>
                    this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime)
                );

                if (fightPotion.length >= 2) {
                    consumeData[name].prePot += fightPercentage;
                    consumeData[name].fightPot += fightPercentage;
                } else if (fightPotion.length === 1) {
                    if (Math.abs(fightPotion[0].startTime - fightStart) < 5000) {
                        consumeData[name].prePot += fightPercentage;
                    } else {
                        consumeData[name].fightPot += fightPercentage;
                        if (prepotExcludedFights.includes(fight.boss))
                            consumeData[name].prePot += fightPercentage;
                    }
                } else {
                    if (prepotExcludedFights.includes(fight.boss))
                        consumeData[name].prePot += fightPercentage;
                }

                consumeData[name].foodPercentage +=
                    (fightFood.reduce(
                        (acc, cur) =>
                            acc +
                            (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)),
                        0
                    ) *
                        fightPercentage) /
                    (fightEnd - fightStart);
                consumeData[name].dualElixirPercentage +=
                    ((fightElixir.reduce(
                        (acc, cur) =>
                            acc +
                            (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)),
                        0
                    ) /
                        2) *
                        fightPercentage) /
                    (fightEnd - fightStart);
                consumeData[name].flaskPercentage +=
                    (fightFlask.reduce(
                        (acc, cur) =>
                            acc +
                            (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)),
                        0
                    ) *
                        fightPercentage) /
                    (fightEnd - fightStart);
            });
        });
        Object.keys(consumeData).forEach(n => {
            consumeData[n].usesElixirs =
                consumeData[n].dualElixirPercentage > consumeData[n].flaskPercentage;
        });

        return consumeData;
    }

    static async getBombInfo(apiKey: string, report: ProcessedReport, fightIndex?: number) {
        const bombs: Record<string, WclBombData> = {};
        for (let i = 0; i < report.fights.length; i++) {
            if (fightIndex != null && i !== fightIndex) continue;
            const url = `${this.getTableUrl(apiKey, report.id, "casts")}&start=${
                report.fights[i].start
            }&end=${report.fights[i].end}&filter=ability.id=56350 OR ability.id=56488`;
            const data = (await axios(url)).data.entries;
            data.forEach((player: any) => {
                if (!bombs[player.name]) bombs[player.name] = { bombs: 0, sappers: 0 };
                bombs[player.name].bombs +=
                    player.abilities?.find((a: any) => a.name === "Saronite Bomb")?.total || 0;
                bombs[player.name].sappers +=
                    player.abilities?.find((a: any) => a.name === "Global Thermal Sapper Charge")
                        ?.total || 0;
            });
        }
        return bombs;
    }

    static sortCharacters(a: ProcessedCharacter, b: ProcessedCharacter) {
        const getCharacterValue = (char: ProcessedCharacter) => {
            let val = 0;
            switch (char.mainRole) {
                case "dps":
                    val = 0;
                    break;
                case "healer":
                    val += 1000;
                    break;
                case "tank":
                    val += 2000;
                    break;
                default:
                    val += 10000;
                    break;
            }
            switch (char.class) {
                case "Warrior":
                    val += 0;
                    break;
                case "Paladin":
                    val += 50;
                    break;
                case "DeathKnight":
                    val += 100;
                    break;
                case "Shaman":
                    val += 150;
                    break;
                case "Hunter":
                    val += 200;
                    break;
                case "Rogue":
                    val += 250;
                    break;
                case "Druid":
                    val += 300;
                    break;
                case "Mage":
                    val += 350;
                    break;
                case "Warlock":
                    val += 400;
                    break;
                case "Priest":
                    val += 450;
                    break;
            }
            switch (char.specs[0]) {
                case "Restoration":
                case "Discipline":
                case "Holy":
                    val += 500;
                    break;
                case "Protection":
                case "Justicar":
                case "Runeblade":
                    val += 1500;
                    break;
            }

            return val;
        };

        return getCharacterValue(a) - getCharacterValue(b);
    }

    static async getAnalysisPage(
        apiKey: string,
        report: ProcessedReport,
        boss: number,
        table: AnalysisTableName,
        attempt: number | "all"
    ) {
        const fights = report.fights.filter(f => f.boss === boss);
        const start =
            attempt === "all"
                ? fights[0].start
                : fights.length > attempt
                ? fights[attempt].start
                : 0;
        const end =
            attempt === "all"
                ? fights.slice(-1)[0].end
                : fights.length > attempt
                ? fights[attempt].end
                : 9999999999;
        // For now, let's just note down what we need
        const urls: Record<number, string[]> = {
            845: [
                //Marrowgar
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=36619 OR target.id=38711 OR target.id=38712`, //bone spikes
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69146`, //coldflame
            ],
            846: [
                //LDW
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=37949 OR target.id=38010 OR target.id=38136 OR target.id=37890 OR target.id=38009 OR target.id=38135`, //adds,
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&targetAurasPresent=71289&options=8192`, //Damage to MC targets
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "interrupts"
                )}&start=${start}&end=${end}&filter=target.id=37949 OR target.id=38010 OR target.id=38136 OR target.id=37890 OR target.id=38009 OR target.id=38135`, //interrupts,
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "casts"
                )}&start=${start}&end=${end}&targetAurasPresent=71289&filter=${[
                    33786, 51514, 61305, 61780, 28272, 61025, 28271, 118, 12824, 12825, 12826,
                ]
                    .map(id => `ability.id=${id}`)
                    .join(" OR ")}`, //CC
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71001`, //DnD
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=1&filter=source.id=38222`, //ghost melee
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71544`, //ghost blast
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "dispels"
                )}&start=${start}&end=${end}&abilityid=71237`, //decurses
            ],
            848: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=38508`, //blood beasts
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=1&filter=source.id=38508`, //blood beast melee
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72380`, //blood nova splash - need to find multiple hits in short time to find splashes,
            ],
            849: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69244`, //vile gas splash, use source to find the culprits, note - same ID!
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72297`, //malleable goo
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69195`, //pungent blight
            ],
            850: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69244`, //vile gas splash, use source to find the culprits, note - same ID!
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69507`, //slime spray
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69833`, //unstable ooze explosion
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69789`, //ooze flood
            ],
            851: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=37562`, //red slime
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=37697`, //green slime
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70346`, //slime puddle
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70853`, //malleable goo
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71278`, //gas bomb
            ],
            852: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71944`, //shock vortex
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72038`, //empowered shock vortex
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72999`, //shadowPrison
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&options=8192&filter=target.id=38369`, //dark nuclei
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "dispels"
                )}&start=${start}&end=${end}&abilityid=71807`, //dispels
            ],
            853: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71447`, //bolt splash
            ],
            854: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=36791`, //blazing
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=37863`, //suppressors
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70702`, //columnOfFrost
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=71086`, //manaVoid
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70744`, //acidBurst
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70633`, //gutSpray
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=1&filter=source.id=37907`, //wormMelee
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "interrupts"
                )}&start=${start}&end=${end}&filter=target.id=37868`, //interrupts
            ],
            855: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70106`, //chilledToTheBone
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69770&filter=source.id != target.id`, //instabilitySplash
                `${this.getEventsUrl(
                    apiKey,
                    report.id,
                    "debuffs"
                )}&start=${start}&end=${end}&abilityid=70127`, //mysticBuffet
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70123`, //blisteringCold
            ],
            856: [
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=36701`, //ragingSpirit
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=36609`, //valkyr
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-done"
                )}&start=${start}&end=${end}&filter=target.id=37799&options=8192`, //vileSpirit
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72149`, //shockwave
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=69242`, //soulShriek
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72133`, //painAndSuffering
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=72754`, //defile
                `${this.getTableUrl(
                    apiKey,
                    report.id,
                    "damage-taken"
                )}&start=${start}&end=${end}&abilityid=70503`, //spiritSplash
            ],
        };
        const url = urls[boss][tableNames[boss].findIndex(f => f === table)];
        console.log(url);
        const data = (await axios(url)).data;
        if (url.includes("damage-done")) {
            const output: DamageDone = {};
            report.characters.forEach(character => {
                output[character.name] = {
                    damage: data.entries.find((e: any) => e.name === character.name)?.total || 0,
                };
            });
            return { type: "damage-done", data: output };
        } else if (url.includes("damage-taken") && !url.includes("/events/")) {
            const output: DamageTaken = {};
            report.characters.forEach(character => {
                const found = data.entries.find((e: any) => e.name === character.name);
                if (!found) output[character.name] = { ticks: 0, total: 0 };
                else
                    output[character.name] = {
                        ticks: found.hitCount + found.tickCount,
                        total: found.total,
                    };
            });
            return { type: "damage-taken", data: output };
        } else if (url.includes("interrupts")) {
            const output: ActionsPerformed = {};
            report.characters.forEach(character => {
                const found = data.events.filter((e: any) => e.sourceID === character.id);
                if (!found.length) output[character.name] = { actions: 0 };
                else output[character.name] = { actions: found.length };
            });
            return { type: "actions-performed", data: output };
        } else if (url.includes("dispels")) {
            const output: ActionsPerformed = {};
            report.characters.forEach(character => {
                const found = data.events.filter((e: any) => e.sourceID === character.id);
                if (!found.length) output[character.name] = { actions: 0 };
                else output[character.name] = { actions: found.length };
            });
            return { type: "actions-performed", data: output };
        } else if (url.includes("debuffs") && url.includes("/events/")) {
            const output: DebuffStacks = {};
            report.characters.forEach(character => {
                const events = data.events
                    .filter((e: any) => e.targetID === character.id)
                    .sort((a: any, b: any) => a.timestamp - b.timestamp);
                output[character.name] = { maxStacks: 0, totalStacks: 0 };
                let curStacks = 0;
                events.forEach((e: any) => {
                    if (e.type === "applydebuff") {
                        curStacks++;
                        output[character.name].totalStacks++;
                        console.log(
                            character.name,
                            curStacks,
                            output[character.name].totalStacks,
                            "apply"
                        );
                    } else if (e.type === "applydebuffstack") {
                        output[character.name].totalStacks += e.stack - curStacks;
                        curStacks = e.stack;
                        console.log(
                            character.name,
                            curStacks,
                            output[character.name].totalStacks,
                            "add"
                        );
                    } else if (e.type === "removedebuff") {
                        curStacks = 0;
                        console.log(
                            character.name,
                            curStacks,
                            output[character.name].totalStacks,
                            "clear"
                        );
                    }
                    output[character.name].maxStacks = Math.max(
                        output[character.name].maxStacks,
                        curStacks
                    );
                });
                console.log(output);
                return { type: "debuff-stacks", data: output };
            });
        } else if (url.includes("casts") && url.includes("/events/")) {
            const output: ActionsPerformed = {};
            report.characters.forEach(character => {
                const found = data.events.filter((e: any) => e.sourceID === character.id);
                if (!found.length) output[character.name] = { actions: 0 };
                else output[character.name] = { actions: found.length };
            });
            return { type: "actions-performed", data: output };
        } else if (
            url.includes("damage-taken") &&
            url.includes("/events/") &&
            url.includes("72380")
        ) {
            //special case for blood nova splash on saurfang - need to look at damage taken and compare timestamps
            const output: DamageTaken = {};
            for (let i = 0; i < data.events.length; i++) {
                let found = false;
                const nameA = report.characters.find(c => c.id === data.events[i].targetID);
                if (!nameA) {
                    console.error("Failed to find character with ID " + data.events[i].targetID);
                    break;
                }
                for (let j = i + 1; j < data.events.length; j++) {
                    if (data.events[i].timestamp === data.events[j].timestamp) {
                        //events have matching timestamp, and so there has been splash damage
                        const nameB = report.characters.find(c => c.id === data.events[j].targetID);
                        if (!nameB) {
                            console.error(
                                "Failed to find character with ID " + data.events[j].targetID
                            );
                            break;
                        }
                        if (!found) {
                            if (!output[nameA.name]) output[nameA.name] = { ticks: 0, total: 0 };
                            output[nameA.name].ticks++;
                            output[nameA.name].total += data.events[i].amount;
                            found = true;
                        }
                        if (!output[nameB.name]) output[nameB.name] = { ticks: 0, total: 0 };
                        output[nameB.name].ticks++;
                        output[nameB.name].total += data.events[j].amount;
                    } else {
                        i = j + 1;
                        break;
                    }
                }
            }
            return { type: "damage-taken", data: output };
        } else {
            return { type: "error", data };
        }
    }
}

export default WCL;
