import axios from "axios";
import { ProcessedCharacter, ProcessedFight, WclAura, WclAuraWithBand, WclBand, WclConsumeData, WclFight, WclFriendly, WclReport } from "./WclTypes";
import { socketsByItemId } from "./socketsByItemId";
import GemUtils from "./gems";

class WCL {
    private static baseUrl = "https://classic.warcraftlogs.com:443/v1";

    private static getTableUrl(apiKey: string, reportId: string, table: string) {
        return `${this.baseUrl}/report/tables/${table}/${reportId}?api_key=${apiKey}`;
    }

    static async getLog(apiKey: string, reportId: string): Promise<WclReport> {
        if(!apiKey) throw new Error("No API key provided");
        const report = (await axios(`${this.baseUrl}/report/fights/${reportId}?api_key=${apiKey}`)).data;
        delete report.enemies;
        delete report.enemyPets;
        delete report.exportedCharacters;
        delete report.friendlyPets;
        delete report.phases;
        const fights = report.fights.filter((f: WclFight) => f.boss > 0 && f.zoneName === "Icecrown Citadel");
        const friendlies = report.friendlies.filter((f: WclFriendly) => {
            if(f.type === "Pet") return false;
            if(f.type === "Unknown") return false;
            if(f.type === "NPC") return false;
            if(f.type === "Boss") return false;
            if(f.fights.length < (fights.length / 2)) return false;
            return true;
        });
        return {
            ...report,
            id: reportId,
            fights,
            friendlies,
        }
    }

    static async getProcessedFight(apiKey: string, reportId: string, rawFight: WclFight): Promise<ProcessedFight> {
        if(!apiKey) throw new Error("No API key provided");
        const summary = (await axios(`${this.getTableUrl(apiKey, reportId, "summary")}&start=${rawFight.start_time}&end=${rawFight.end_time}`)).data;
        const getPlayerData = (player: any) => {
            return {
                name: player.name,
                class: player.type,
                spec: player.specs?.length ? player.specs[0] : "Unknown",
                damageDone: summary.damageDone.find((d: any) => d.name === player.name)?.total || 0,
                healingDone: summary.healingDone.find((d: any) => d.name === player.name)?.total || 0,
                gearIssues: this.getGearIssues(player.combatantInfo.gear),
            }
        }
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
        }
        return processedFight;
    }

    static getGearIssues(gear: any) {
        if(!gear) return ["No gear found"];
        let redCount = 0;
        let yellowCount = 0;
        let blueCount = 0;
        let nonEpicCount = 0;
        let metaId: number | null = null;
        const issues: any[] = [];
        gear.forEach((item: any) => {
            const sockets = socketsByItemId[item.id.toString()];
            if(!sockets) return;
            const enchantId = item.permanentEnchant || null;
            const enchantValid = GemUtils.getEnchantValid(enchantId);
            if(!enchantValid) issues.push("Invalid enchant on " + item.name + ": " + enchantId);
            if((item.gems?.length || 0) < sockets) {
                issues.push("Missing gems on " + item.name);
            }
            if(!item.gems) return;
            item.gems.forEach((gem: any) => {
                switch(gem.icon) {
                    case "inv_jewelcrafting_gem_37.jpg":
                    case "inv_jewelcrafting_dragonseye05.jpg":
                        redCount++;
                        break;
                    case "inv_jewelcrafting_gem_38.jpg":
                    case "inv_jewelcrafting_dragonseye03.jpg":
                        yellowCount++;
                        break;
                    case "inv_jewelcrafting_gem_42.jpg":
                    case "inv_jewelcrafting_dragonseye04.jpg":
                        blueCount++;
                        break;
                    case "inv_jewelcrafting_gem_41.jpg":
                        blueCount++;
                        yellowCount++;
                        break;
                    case "inv_jewelcrafting_gem_39.jpg":
                        redCount++;
                        yellowCount++;
                        break;
                    case "inv_jewelcrafting_gem_40.jpg":
                        redCount++;
                        blueCount++;
                        break;
                    case "inv_jewelcrafting_icediamond_02.jpg":
                    case "inv_jewelcrafting_shadowspirit_02.jpg":
                    case "inv_misc_gem_diamond_07.jpg":
                        metaId = gem.id;
                        break;
                    case "inv_misc_gem_pearl_12.jpg":
                        redCount++;
                        blueCount++;
                        yellowCount++;
                        break;
                    default:
                        nonEpicCount++;
                        issues.push("Bad gem on " + item.name + ": " + gem.id);
                }
            })
        })
    }

    private static boundsContains(boundsStart: number, boundsEnd: number, spanStart: number, spanEnd: number) {
        if(spanStart < boundsStart && spanEnd < boundsStart) return false;
        if(spanStart > boundsEnd && spanEnd > boundsEnd) return false;
        return true;
    }

    static async getConsumeInfo(apiKey: string, report: WclReport, playerName?: string) {
        if(!apiKey) throw new Error("No API key provided");
        const consumesByCharacter: Record<string, {
            prepot: number;
            fightPos: number;
            flaskElixirPercentage: number;
        }> = {};
        report.friendlies.forEach(f => consumesByCharacter[f.name] = {
            prepot: 0,
            fightPos: 0,
            flaskElixirPercentage: 0
        });
        const fightStart = report.fights[0].start_time;
        const fightEnd = report.fights.slice(-1)[0].end_time;
        const foodBuffs = [
            57358, 57325, 57334, 57356, 57329, 57327, 57332, 57360, 57367, 57365, 57371, 57399,
        ];
        const flasks = [
            53760, 53755, 53758, 62380, 54212,
        ];
        const elixirs = [
            53749, 60346, 53747, 60347, 53746, 33721, 60343, 53741, 28497, 53748, 53764,
        ];
        const potions = [
            53908, 53909, 53762,
        ];
        const prepotExcludedFights = [
            847, 854
        ];
        const allData: Record<string, WclAuraWithBand[]> = {};
        for(let i = 0; i < report.friendlies.length; i++) {
            if(playerName && report.friendlies[i].name !== playerName) continue;
            const f = report.friendlies[i];
            const url = `${this.getTableUrl(apiKey, report.id, "buffs")}&start=${fightStart}&end=${fightEnd}&sourceid=${f.id}`;
            console.log("Fetching consume data for " + f.name);
            const data = (await axios(url)).data;
            const spreadData: WclAuraWithBand[] = [];
            data.auras.forEach((a: WclAura) => {
                a.bands.forEach((b: WclBand) => {
                    const band: any = { ...a, startTime: b.startTime, endTime: b.endTime };
                    delete band.bands;
                    spreadData.push(band);
                });
            });
            allData[f.name] = spreadData;
        }

        const consumeData: Record<string, WclConsumeData> = {};
        const totalFightDuration = report.fights.reduce((acc, cur) => acc + (cur.end_time - cur.start_time), 0);
        Object.keys(allData).forEach(name => {
            consumeData[name] = { prePot: 0, fightPot: 0, flaskPercentage: 0, dualElixirPercentage: 0, foodPercentage: 0 };
            const foodAuras = allData[name].filter(a => foodBuffs.includes(a.guid));
            const flaskAuras = allData[name].filter(a => flasks.includes(a.guid));
            const elixirAuras = allData[name].filter(a => elixirs.includes(a.guid));
            const potionAuras = allData[name].filter(a => potions.includes(a.guid));
            report.fights.forEach(fight => {
                const fightStart = fight.start_time;
                const fightEnd = fight.end_time;
                const fightPercentage = (fightEnd - fightStart) / totalFightDuration;
                const fightFood = foodAuras.filter(a => this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime));
                const fightFlask = flaskAuras.filter(a => this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime));
                const fightElixir = elixirAuras.filter(a => this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime));
                const fightPotion = potionAuras.filter(a => this.boundsContains(fightStart, fightEnd, a.startTime, a.endTime));

                if(fightPotion.length >= 2) {
                    consumeData[name].prePot += fightPercentage;
                    consumeData[name].fightPot += fightPercentage;
                } else if(fightPotion.length === 1) {
                    if(Math.abs(fightPotion[0].startTime - fightStart) < 5000) {
                        consumeData[name].prePot += fightPercentage;
                    } else {
                        consumeData[name].fightPot += fightPercentage;
                        if(prepotExcludedFights.includes(fight.boss)) consumeData[name].prePot += fightPercentage;
                    }
                } else {
                    if(prepotExcludedFights.includes(fight.boss)) consumeData[name].prePot += fightPercentage;
                }

                consumeData[name].foodPercentage += (fightFood.reduce((acc, cur) => acc + (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)), 0)) * fightPercentage / (fightEnd - fightStart);
                consumeData[name].dualElixirPercentage += (fightElixir.reduce((acc, cur) => acc + (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)), 0) / 2) * fightPercentage / (fightEnd - fightStart);
                consumeData[name].flaskPercentage += (fightFlask.reduce((acc, cur) => acc + (Math.min(cur.endTime, fightEnd) - Math.max(cur.startTime, fightStart)), 0)) * fightPercentage / (fightEnd - fightStart);
            });
        })

        return consumeData;
    }

    static sortCharacters(a: ProcessedCharacter, b: ProcessedCharacter) {
        const getCharacterValue = (char: ProcessedCharacter) => {
            let val = 0;
            switch(char.mainRole) {
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
            switch(char.class) {
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
            switch(char.specs[0]) {
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
        }
        
        return getCharacterValue(a) - getCharacterValue(b);
    }
}

export default WCL;