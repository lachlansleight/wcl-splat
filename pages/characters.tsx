import axios from "axios";
import Button from "components/controls/Button";
import ProgressBar from "components/controls/ProgressBar";
import Layout from "components/layout/Layout";
import ProcessedFightCharacter from "components/wcl/ProcessedFightCharacter";
import WCL from "lib/WCL";
import { ProcessedFight, ProcessedReport } from "lib/WclTypes";
import ColorUtils from "lib/colors";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";
import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";


const CharactersPage = (): JSX.Element => {

    const {config} = useConfig();
    const {logData, setLogData} = useLog();
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingIndex, setLoadingIndex] = useState(0);
    
    const processReport = useCallback(async () => {
        if(loading) return;
        if(!logData.rawReport) return;
        if(!config.keyValid) return;
        setLoading(true);
        setLoadingProgress(0);

        const baseReport: ProcessedReport = {
            id: logData.rawReport.id,
            start: logData.rawReport.start,
            end: logData.rawReport.end,
            owner: logData.rawReport.owner,
            title: logData.rawReport.title,
            fights: [],
            characters: [],
        }
        for(let i = 0; i < logData.rawReport.fights.length; i++) {
            setLoadingIndex(i + 1);
            const processedFight: ProcessedFight = (await axios.post(`/api/fight?apiKey=${config.apiKey}&reportId=${logData.reportId}`, {rawFight: logData.rawReport.fights[i]})).data;
            baseReport.fights.push(processedFight);
            processedFight.dps.forEach(dps => {
                let index = baseReport.characters.findIndex(c => c.name === dps.name);
                if(index === -1) {
                    baseReport.characters.push({
                        name: dps.name,
                        class: dps.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                    });
                    index = baseReport.characters.length - 1;
                }
                if(!baseReport.characters[index].specs.includes(dps.spec)) baseReport.characters[index].specs.push(dps.spec);
                dps.gearIssues?.forEach(issue => {
                    if(!baseReport.characters[index].gearIssues.includes(issue)) baseReport.characters[index].gearIssues.push(issue);
                })
                baseReport.characters[index].fightsAsDps++;
            });
            processedFight.healers.forEach(healer => {
                let index = baseReport.characters.findIndex(c => c.name === healer.name);
                if(index === -1) {
                    baseReport.characters.push({
                        name: healer.name,
                        class: healer.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                    });
                    index = baseReport.characters.length - 1;
                }
                if(!baseReport.characters[index].specs.includes(healer.spec)) baseReport.characters[index].specs.push(healer.spec);
                healer.gearIssues?.forEach(issue => {
                    if(!baseReport.characters[index].gearIssues.includes(issue)) baseReport.characters[index].gearIssues.push(issue);
                })
                baseReport.characters[index].fightsAsHealer++;
            });
            processedFight.tanks.forEach(tank => {
                let index = baseReport.characters.findIndex(c => c.name === tank.name);
                if(index === -1) {
                    baseReport.characters.push({
                        name: tank.name,
                        class: tank.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                    });
                    index = baseReport.characters.length - 1;
                }
                if(!baseReport.characters[index].specs.includes(tank.spec)) baseReport.characters[index].specs.push(tank.spec);
                tank.gearIssues?.forEach(issue => {
                    if(!baseReport.characters[index].gearIssues.includes(issue)) baseReport.characters[index].gearIssues.push(issue);
                })
                baseReport.characters[index].fightsAsTank++;
            });
            baseReport.characters.forEach(character => {
                if(character.fightsAsDps > character.fightsAsHealer && character.fightsAsDps > character.fightsAsTank) character.mainRole = "dps";
                if(character.fightsAsHealer > character.fightsAsDps && character.fightsAsHealer > character.fightsAsTank) character.mainRole = "healer";
                if(character.fightsAsTank > character.fightsAsDps && character.fightsAsTank > character.fightsAsHealer) character.mainRole = "tank";
            });
            baseReport.characters.sort(WCL.sortCharacters);
            setLogData(cur => ({...cur, processedReport: {...baseReport}}));
            setLoadingProgress((i + 1) / (logData.rawReport.fights.length + 1));
        }
        setLoading(false);

    }, [loading, config.keyValid, config.apiKey, logData.rawReport]);

    if(!logData.reportId) {
        return (
            <Layout>
                <p>No report is loaded</p>
            </Layout>
        )
    }

    if(!logData.processedReport) {
        return (
            <Layout>
                <div className="grid place-items-center h-96">
                    <div className="flex flex-col gap-4 w-1/2 items-center justify-center">
                        {loading ? (
                            <div className="w-full flex flex-col items-center gap-2">
                                <FaSync className="text-4xl animate-spin" />
                                <ProgressBar progress={loadingProgress} containerClassName="h-8 border border-white rounded w-full grid place-items-center" color="#4ade8040">
                                    Processed encounter {loadingIndex} of {logData.rawReport?.fights?.length || 0}
                                </ProgressBar>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl">{config.logs.find(l => l.id === logData.reportId)?.title || ""}</h1>
                                <Button onClick={processReport}>Load Fights Overview</Button>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            {loading && (
                <div className="w-full flex flex-col items-center gap-2">
                    <FaSync className="text-4xl animate-spin" />
                    <ProgressBar progress={loadingProgress} containerClassName="h-8 border border-white rounded w-full grid place-items-center" color="#4ade8040">
                        Processed encounter {loadingIndex} of {logData.rawReport?.fights?.length || 0}
                    </ProgressBar>
                </div>
            )}
            <div className="flex">
                <div className="flex flex-col gap-2 w-full md:w-1/2 md:pr-2">
                    <h2 className="text-xl">Tanks</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "tank").map((c, i) => (
                        <ProcessedFightCharacter key={i} character={c} fights={logData.processedReport?.fights || []} />
                    ))}
                    <h2 className="text-xl mt-4">Healers</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "healer").map((c, i) => (
                        <ProcessedFightCharacter key={i} character={c} fights={logData.processedReport?.fights || []} />
                    ))}
                </div>
                <div className="flex flex-col gap-4 w-full md:w-1/2 md:pl-2">
                    <h2 className="text-xl">DPS</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "dps").map((c, i) => (
                        <ProcessedFightCharacter key={i} character={c} fights={logData.processedReport?.fights || []} />
                    ))}
                </div>
            </div>
        </Layout>
    )
}

export default CharactersPage;