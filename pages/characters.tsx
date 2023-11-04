import axios from "axios";
import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";
import Button from "components/controls/Button";
import ProgressBar from "components/controls/ProgressBar";
import Layout from "components/layout/Layout";
import WCL from "lib/WCL";
import { ProcessedFight, ProcessedReport, WclBombData } from "lib/WclTypes";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";
import ProcessedFightCharacterRow from "components/wcl/ProcessedFightCharacterRow";

const CharactersPage = (): JSX.Element => {
    const { config } = useConfig();
    const { logData, setLogData } = useLog();
    const [loading, setLoading] = useState("");
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingIndex, setLoadingIndex] = useState(0);

    const processReport = useCallback(async () => {
        if (loading) return;
        if (!logData.rawReport) return;
        if (!config.keyValid) return;
        setLoading("base");
        setLoadingProgress(0);

        const baseReport: ProcessedReport = {
            id: logData.rawReport.id,
            start: logData.rawReport.start,
            end: logData.rawReport.end,
            owner: logData.rawReport.owner,
            title: logData.rawReport.title,
            fights: [],
            characters: [],
        };
        for (let i = 0; i < logData.rawReport.fights.length; i++) {
            setLoadingIndex(i + 1);
            const processedFight: ProcessedFight = (
                await axios.post(
                    `/api/fight?apiKey=${config.apiKey}&reportId=${logData.reportId}`,
                    { rawFight: logData.rawReport.fights[i] }
                )
            ).data;
            baseReport.fights.push(processedFight);
            processedFight.dps.forEach(dps => {
                let index = baseReport.characters.findIndex(c => c.name === dps.name);
                if (index === -1) {
                    baseReport.characters.push({
                        id: dps.id,
                        name: dps.name,
                        class: dps.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                        isEngineer: dps.isEngineer,
                    });
                    index = baseReport.characters.length - 1;
                }
                if (!baseReport.characters[index].specs.includes(dps.spec))
                    baseReport.characters[index].specs.push(dps.spec);
                dps.gearIssues?.forEach(issue => {
                    if (!baseReport.characters[index].gearIssues.includes(issue))
                        baseReport.characters[index].gearIssues.push(issue);
                });
                if (dps.isEngineer) baseReport.characters[index].isEngineer = true;
                baseReport.characters[index].fightsAsDps++;
            });
            processedFight.healers.forEach(healer => {
                let index = baseReport.characters.findIndex(c => c.name === healer.name);
                if (index === -1) {
                    baseReport.characters.push({
                        id: healer.id,
                        name: healer.name,
                        class: healer.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                        isEngineer: healer.isEngineer,
                    });
                    index = baseReport.characters.length - 1;
                }
                if (!baseReport.characters[index].specs.includes(healer.spec))
                    baseReport.characters[index].specs.push(healer.spec);
                healer.gearIssues?.forEach(issue => {
                    if (!baseReport.characters[index].gearIssues.includes(issue))
                        baseReport.characters[index].gearIssues.push(issue);
                });
                if (healer.isEngineer) baseReport.characters[index].isEngineer = true;
                baseReport.characters[index].fightsAsHealer++;
            });
            processedFight.tanks.forEach(tank => {
                let index = baseReport.characters.findIndex(c => c.name === tank.name);
                if (index === -1) {
                    baseReport.characters.push({
                        id: tank.id,
                        name: tank.name,
                        class: tank.class,
                        specs: [],
                        fightsAsDps: 0,
                        fightsAsHealer: 0,
                        fightsAsTank: 0,
                        mainRole: "unknown",
                        gearIssues: [],
                        isEngineer: tank.isEngineer,
                    });
                    index = baseReport.characters.length - 1;
                }
                if (!baseReport.characters[index].specs.includes(tank.spec))
                    baseReport.characters[index].specs.push(tank.spec);
                tank.gearIssues?.forEach(issue => {
                    if (!baseReport.characters[index].gearIssues.includes(issue))
                        baseReport.characters[index].gearIssues.push(issue);
                });
                if (tank.isEngineer) baseReport.characters[index].isEngineer = true;
                baseReport.characters[index].fightsAsTank++;
            });
            baseReport.characters.forEach(character => {
                if (
                    character.fightsAsDps > character.fightsAsHealer &&
                    character.fightsAsDps > character.fightsAsTank
                )
                    character.mainRole = "dps";
                if (
                    character.fightsAsHealer > character.fightsAsDps &&
                    character.fightsAsHealer > character.fightsAsTank
                )
                    character.mainRole = "healer";
                if (
                    character.fightsAsTank > character.fightsAsDps &&
                    character.fightsAsTank > character.fightsAsHealer
                )
                    character.mainRole = "tank";
            });
            baseReport.characters.sort(WCL.sortCharacters);
            setLogData(cur => ({ ...cur, processedReport: { ...baseReport } }));
            setLoadingProgress((i + 1) / (logData.rawReport.fights.length + 1));
        }
        setLoading("");
    }, [loading, config.keyValid, config.apiKey, logData.rawReport]);

    const processConsumes = useCallback(async () => {
        if (loading) return;
        if (!logData.processedReport) return;
        if (!config.keyValid) return;
        setLoading("consumes");
        setLoadingProgress(0);
        setLoadingIndex(0);

        setLogData(cur => ({ ...cur, consumeData: {} }));
        for (let i = 0; i < logData.processedReport.characters.length; i++) {
            setLoadingIndex(i + 1);
            const character = logData.processedReport.characters[i];
            const consumes = (
                await axios.post(`/api/consumes?apiKey=${config.apiKey}&player=${character.name}`, {
                    report: logData.processedReport,
                })
            ).data;
            setLogData(cur => ({
                ...cur,
                consumeData: { ...cur.consumeData, [character.name]: consumes[character.name] },
            }));
            setLoadingIndex(i + 1);
            setLoadingProgress((i + 1) / logData.processedReport.characters.length);
        }
        setLoading("");
    }, [loading, config.keyValid, config.apiKey, logData.processedReport]);

    const processBombs = useCallback(async () => {
        if (loading) return;
        if (!logData.processedReport) return;
        if (!config.keyValid) return;
        setLoading("bombs");
        setLoadingProgress(0);
        setLoadingIndex(0);

        setLogData(cur => ({ ...cur, bombData: {} }));
        const bombData: Record<string, WclBombData> = {};
        for (let i = 0; i < logData.processedReport.fights.length; i++) {
            setLoadingIndex(i + 1);
            const bombs = (
                await axios.post(`/api/bombs?apiKey=${config.apiKey}&fightIndex=${i}`, {
                    report: logData.processedReport,
                })
            ).data;
            Object.keys(bombs).forEach(name => {
                if (!bombData[name]) bombData[name] = { bombs: 0, sappers: 0 };
                bombData[name].bombs += bombs[name].bombs;
                bombData[name].sappers += bombs[name].sappers;
            });
            console.log(bombs);
            setLogData(cur => ({ ...cur, bombData: { ...bombData } }));
            setLoadingIndex(i + 1);
            setLoadingProgress((i + 1) / logData.processedReport.fights.length);
        }
        setLoading("");
    }, [loading, config.keyValid, config.apiKey, logData.processedReport]);

    if (!logData.reportId) {
        return (
            <Layout>
                <p>No report is loaded</p>
            </Layout>
        );
    }

    if (!logData.processedReport) {
        return (
            <Layout>
                <div className="grid place-items-center h-96">
                    <div className="flex flex-col gap-4 w-1/2 items-center justify-center">
                        {loading ? (
                            <div className="w-full flex flex-col items-center gap-2">
                                <FaSync className="text-4xl animate-spin" />
                                <ProgressBar
                                    progress={loadingProgress}
                                    containerClassName="h-8 border border-white rounded w-full grid place-items-center"
                                    color="#4ade8040"
                                >
                                    Processed encounter {loadingIndex} of{" "}
                                    {logData.rawReport?.fights?.length || 0}
                                </ProgressBar>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl">
                                    {config.logs.find(l => l.id === logData.reportId)?.title || ""}
                                </h1>
                                <Button onClick={processReport}>Process Fights</Button>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {loading ? (
                <div className="w-full flex flex-col items-center gap-2">
                    <FaSync className="text-4xl animate-spin" />
                    <ProgressBar
                        progress={loadingProgress}
                        containerClassName="h-8 border border-white rounded w-full grid place-items-center"
                        color="#4ade8040"
                    >
                        Processed&nbsp;
                        {loading === "base"
                            ? "encounter"
                            : loading === "consumes"
                            ? "player"
                            : "encounter"}{" "}
                        {loadingIndex} of&nbsp;
                        {loading === "base"
                            ? logData.rawReport?.fights?.length || 0
                            : loading === "consumes"
                            ? logData.processedReport?.characters?.length || 0
                            : logData.processedReport?.fights.length || 0}
                    </ProgressBar>
                </div>
            ) : (
                <div className="flex justify-center gap-4 mb-4">
                    {logData.processedReport ? (
                        <Button
                            className="bg-red-400"
                            onClick={() => {
                                if (
                                    !window.confirm(
                                        "Really clear data? You will need to re-process to recover it."
                                    )
                                )
                                    return;
                                setLogData(cur => ({
                                    ...cur,
                                    processedReport: undefined,
                                    consumeData: undefined,
                                    bombData: undefined,
                                }));
                            }}
                        >
                            Clear Fights
                        </Button>
                    ) : (
                        <Button onClick={processReport}>Process Fights</Button>
                    )}
                    {logData.consumeData ? (
                        <Button
                            className="bg-red-400"
                            onClick={() => {
                                if (
                                    !window.confirm(
                                        "Really clear data? You will need to re-process to recover it."
                                    )
                                )
                                    return;
                                setLogData(cur => ({ ...cur, consumeData: undefined }));
                            }}
                        >
                            Clear Consume Usage
                        </Button>
                    ) : (
                        <Button onClick={processConsumes}>Process Consume Usage</Button>
                    )}
                    {logData.bombData ? (
                        <Button
                            className="bg-red-400"
                            onClick={() => {
                                if (
                                    !window.confirm(
                                        "Really clear data? You will need to re-process to recover it."
                                    )
                                )
                                    return;
                                setLogData(cur => ({ ...cur, bombData: undefined }));
                            }}
                        >
                            Clear Bomb Usage
                        </Button>
                    ) : (
                        <Button onClick={processBombs}>Process Bomb Usage</Button>
                    )}
                </div>
            )}
            {/* <div className="flex">
                <div className="flex flex-col gap-2 w-full md:w-1/2 md:pr-2">
                    <h2 className="text-xl">Tanks</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "tank").map((c, i) => (
                        <ProcessedFightCharacter 
                            key={i} 
                            character={c} 
                            fights={logData.processedReport ? [...logData.processedReport.fights] : []} 
                            consumes={logData.consumeData ? {...logData.consumeData[c.name]} : undefined} 
                            bombs={logData.bombData ? {...logData.bombData[c.name]} : undefined} 
                        />
                    ))}
                    <h2 className="text-xl mt-4">Healers</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "healer").map((c, i) => (
                        <ProcessedFightCharacter 
                            key={i} 
                            character={c} 
                            fights={logData.processedReport ? [...logData.processedReport.fights] : []} 
                            consumes={logData.consumeData ? {...logData.consumeData[c.name]} : undefined} 
                            bombs={logData.bombData ? {...logData.bombData[c.name]} : undefined} 
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-4 w-full md:w-1/2 md:pl-2">
                    <h2 className="text-xl">DPS</h2>
                    {logData.processedReport.characters.filter(c => c.mainRole === "dps").map((c, i) => (
                        <ProcessedFightCharacter 
                            key={i} 
                            character={c} 
                            fights={logData.processedReport ? [...logData.processedReport.fights] : []} 
                            consumes={logData.consumeData ? {...logData.consumeData[c.name]} : undefined} 
                            bombs={logData.bombData ? {...logData.bombData[c.name]} : undefined} 
                        />
                    ))}
                </div>
            </div> */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 border-b-2 border-white pb-1 mb-2 font-bold">
                    <div className="w-72">Character</div>
                    <div className="text-center w-4" />
                    <div className="text-center w-20">Damage Healing</div>
                    <div className="text-center w-4" />
                    <div className="text-center w-12">Prepot</div>
                    <div className="text-center w-12">Fight Pot</div>
                    <div className="text-center w-12">Food</div>
                    <div className="text-center w-12">Elixir Flask</div>
                    <div className="text-center w-4" />
                    <div className="text-center w-12">Bombs</div>
                    <div className="text-center w-12">Sappers</div>
                </div>
                {logData.processedReport.characters
                    .filter(c => c.mainRole === "tank")
                    .map((c, i) => (
                        <ProcessedFightCharacterRow
                            key={i}
                            character={c}
                            fights={
                                logData.processedReport ? [...logData.processedReport.fights] : []
                            }
                            consumes={
                                logData.consumeData ? { ...logData.consumeData[c.name] } : undefined
                            }
                            bombs={logData.bombData ? { ...logData.bombData[c.name] } : undefined}
                        />
                    ))}
                <div className="h-4" />
                {logData.processedReport.characters
                    .filter(c => c.mainRole === "healer")
                    .map((c, i) => (
                        <ProcessedFightCharacterRow
                            key={i}
                            character={c}
                            fights={
                                logData.processedReport ? [...logData.processedReport.fights] : []
                            }
                            consumes={
                                logData.consumeData ? { ...logData.consumeData[c.name] } : undefined
                            }
                            bombs={logData.bombData ? { ...logData.bombData[c.name] } : undefined}
                        />
                    ))}
                <div className="h-4" />
                {logData.processedReport.characters
                    .filter(c => c.mainRole === "dps")
                    .map((c, i) => (
                        <ProcessedFightCharacterRow
                            key={i}
                            character={c}
                            fights={
                                logData.processedReport ? [...logData.processedReport.fights] : []
                            }
                            consumes={
                                logData.consumeData ? { ...logData.consumeData[c.name] } : undefined
                            }
                            bombs={logData.bombData ? { ...logData.bombData[c.name] } : undefined}
                        />
                    ))}
            </div>
        </Layout>
    );
};

export default CharactersPage;
