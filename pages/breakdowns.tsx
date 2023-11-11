import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import Button from "components/controls/Button";
import ProgressBar from "components/controls/ProgressBar";
import Layout from "components/layout/Layout";
import {
    AnalysisFightSelection,
    AnalysisTableName,
    WclFullAnalysisFight,
    WclFullAnalysisTableType,
    isActionsPerformedTable,
    isDamageDoneTable,
    isDamageTakenTable,
    isDebuffsTable,
    prettyTableNames,
    tableNames,
} from "lib/WclTypes";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";
import AnalysisSelector from "components/wcl/AnalysisSelector";
import WclFullAnalysisTable from "components/wcl/WclFullAnalysisTable";

const CharactersPage = (): JSX.Element => {
    const { config } = useConfig();
    const { logData, setLogData } = useLog();

    const [boss, setBoss] = useState(0);
    const [table, setTable] = useState<AnalysisTableName>("acidBurst");
    const [fight, setFight] = useState<AnalysisFightSelection>("all");

    const [loading, setLoading] = useState("");
    const [loadingInfo, setLoadingInfo] = useState({
        bossName: "",
        attempt: 0,
        totalAttempts: 0,
        tableName: "",
        tableCount: 0,
        totalIndex: 0,
        totalCount: 0,
        totalProgress: 0,
    });

    const processBoss = useCallback(async () => {
        if (!logData.processedReport) return;
        if (!config.apiKey) return;
        if (!config.keyValid) return;

        const fights = logData.processedReport.fights.filter(f => f.boss === boss);
        console.log({ fights });
        if (fights.length === 0) return;
        const totalCount = tableNames[boss].length * fights.length;
        setLoadingInfo(cur => ({
            ...cur,
            bossName: fights[0].name,
            attempt: 0,
            totalAttempts: fights.length,
            tableName: "",
            tableCount: tableNames[boss].length,
            totalCount,
            totalIndex: 0,
            totalProgress: 0,
        }));
        setLoading(fights[0].name);
        const allFights: WclFullAnalysisFight[] = [];
        const combinedFight: WclFullAnalysisFight = {
            fightId: "all",
            processed: false,
            tables: {},
            type: "unknown",
        };
        for (let i = 0; i < fights.length; i++) {
            setLoadingInfo(cur => ({ ...cur, attempt: i }));
            const fight: WclFullAnalysisFight = {
                fightId: i,
                processed: false,
                tables: {},
                type: "unknown",
            };
            for (let j = 0; j < tableNames[boss].length; j++) {
                setLoadingInfo(cur => ({
                    ...cur,
                    tableName: prettyTableNames[tableNames[boss][j]],
                    totalIndex: i * tableNames[boss].length + j,
                }));
                const data = (
                    await axios.post(
                        `/api/breakdown?boss=${boss}&table=${tableNames[boss][j]}&attempt=${i}&apiKey=${config.apiKey}`,
                        { processedReport: logData.processedReport }
                    )
                ).data;
                console.log(i, j, tableNames[boss][j], data.data);
                fight.tables[tableNames[boss][j]] = data.data;
                fight.type = data.type;
                combinedFight.type = data.type;
                setLoadingInfo(cur => ({
                    ...cur,
                    totalProgress: (i * tableNames[boss].length + j + 1) / totalCount,
                }));
                if (i === 0) {
                    combinedFight.tables[tableNames[boss][j]] = JSON.parse(
                        JSON.stringify(data.data)
                    );
                } else {
                    Object.keys(data.data).forEach(playerName => {
                        if (isDamageDoneTable(data.data)) {
                            (combinedFight.tables[tableNames[boss][j]][playerName] as any).damage +=
                                data.data[playerName].damage;
                        } else if (isDamageTakenTable(data.data)) {
                            (combinedFight.tables[tableNames[boss][j]][playerName] as any).ticks +=
                                data.data[playerName].ticks;
                            (combinedFight.tables[tableNames[boss][j]][playerName] as any).total +=
                                data.data[playerName].total;
                        } else if (isActionsPerformedTable(data.data)) {
                            (
                                combinedFight.tables[tableNames[boss][j]][playerName] as any
                            ).actions += data.data[playerName].actions;
                        }
                    });
                }
            }
            fight.processed = true;
            allFights.push(fight);
        }
        combinedFight.processed = true;
        allFights.push(combinedFight);
        setLogData(cur => ({
            ...cur,
            fullAnalysis: {
                ...cur.fullAnalysis,
                [boss]: allFights,
            },
        }));
        setLoading("");
    }, [boss, config.apiKey, config.keyValid, logData.processedReport, logData.fullAnalysis]);

    const [currentTable, setCurrentTable] = useState<WclFullAnalysisTableType | null>(null);
    const [processedData, setProcessedData] = useState<any>({});
    useEffect(() => {
        const foundTable = logData.fullAnalysis?.[boss]?.find(f => f.fightId === fight)?.tables?.[
            table
        ];
        console.log({ boss, fight, table, foundTable, allData: logData.fullAnalysis });
        setCurrentTable(foundTable || null);
        if (!foundTable) {
            setProcessedData({});
            return;
        }
        if (Object.keys(foundTable).length === 0) {
            setProcessedData({});
            return;
        }
        if (isDamageDoneTable(foundTable)) {
            const maxDamage = Math.max(...Object.values(foundTable).map(d => d.damage));
            setProcessedData({
                type: "damage-done",
                players: Object.keys(foundTable)
                    .map(playerName => {
                        return {
                            ...(logData.processedReport?.characters.find(
                                c => c.name === playerName
                            ) || {}),
                            damage: foundTable[playerName].damage || 0,
                            normalized: (foundTable[playerName].damage || 0) / (maxDamage || 1),
                        };
                    })
                    .sort((a, b) => b.damage - a.damage),
            });
        } else if (isDamageTakenTable(foundTable)) {
            //const maxDamage = Math.max(...Object.values(foundTable).map(d => d.total));
            const maxTicks = Math.max(...Object.values(foundTable).map(d => d.ticks));
            setProcessedData({
                type: "damage-taken",
                players: Object.keys(foundTable)
                    .map(playerName => {
                        return {
                            ...(logData.processedReport?.characters.find(
                                c => c.name === playerName
                            ) || {}),
                            damage: foundTable[playerName].total || 0,
                            ticks: foundTable[playerName].ticks || 0,
                            normalized: (foundTable[playerName].ticks || 0) / (maxTicks || 1),
                        };
                    })
                    .sort((a, b) =>
                        b.ticks === a.ticks ? b.damage - a.damage : b.ticks - a.ticks
                    ),
            });
        } else if (isActionsPerformedTable(foundTable)) {
            const maxActions = Math.max(...Object.values(foundTable).map(d => d.actions));
            setProcessedData({
                type: "actions-performed",
                players: Object.keys(foundTable)
                    .map(playerName => {
                        return {
                            ...(logData.processedReport?.characters.find(
                                c => c.name === playerName
                            ) || {}),
                            actions: foundTable[playerName].actions || 0,
                            normalized: (foundTable[playerName].actions || 0) / (maxActions || 1),
                        };
                    })
                    .sort((a, b) => b.actions - a.actions),
            });
        } else if (isDebuffsTable(foundTable)) {
            const maxStacks = Math.max(...Object.values(foundTable).map(d => d.maxStacks));
            setProcessedData({
                type: "debuff-stacks",
                players: Object.keys(foundTable)
                    .map(playerName => {
                        return {
                            ...(logData.processedReport?.characters.find(
                                c => c.name === playerName
                            ) || {}),
                            totalStacks: foundTable[playerName].totalStacks || 0,
                            maxStacks: foundTable[playerName].maxStacks || 0,
                            normalized: (foundTable[playerName].maxStacks || 0) / (maxStacks || 1),
                        };
                    })
                    .sort((a, b) =>
                        b.maxStacks === a.maxStacks
                            ? b.totalStacks - a.totalStacks
                            : b.maxStacks - a.maxStacks
                    ),
            });
        } else {
            setProcessedData({});
            return;
        }
    }, [logData.fullAnalysis, boss, fight, table]);

    const [tempData, setTempData] = useState<any>(null);

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
                <p>
                    You need to prepare the base character overview before you can do fight
                    breakdowns
                </p>
            </Layout>
        );
    }

    return (
        <Layout>
            <AnalysisSelector
                processedReport={logData.processedReport}
                boss={boss}
                onBossChange={setBoss}
                table={table}
                onTableChange={setTable}
                fight={fight}
                onFightChange={setFight}
            />
            {loading ? (
                <div className="w-full flex flex-col items-center gap-2">
                    <FaSync className="text-4xl animate-spin" />
                    <ProgressBar
                        progress={loadingInfo.totalProgress}
                        containerClassName="h-8 border border-white rounded w-full grid place-items-center"
                        color="#4ade8040"
                    >
                        Processing {loadingInfo.bossName} Attempt {loadingInfo.attempt + 1}/
                        {loadingInfo.totalAttempts}: {loadingInfo.tableName}
                    </ProgressBar>
                </div>
            ) : null}

            {!loading && (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-4">
                        {currentTable ? (
                            <Button
                                onClick={() => {
                                    processBoss();
                                }}
                            >
                                Refresh Data
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    processBoss();
                                }}
                            >
                                Load Data
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                setTempData({ loading: "true" });
                                axios
                                    .post(
                                        `/api/breakdown?boss=${boss}&table=${table}&attempt=${fight}&apiKey=${config.apiKey}`,
                                        { processedReport: logData.processedReport }
                                    )
                                    .then(res => {
                                        console.log(res.data);
                                        setTempData(res.data);
                                    });
                            }}
                        >
                            Load Debug
                        </Button>
                    </div>
                    <WclFullAnalysisTable processedData={{ ...processedData }} />
                    {tempData && <pre>{JSON.stringify(tempData, null, 2)}</pre>}
                </div>
            )}
        </Layout>
    );
};

export default CharactersPage;
