import axios from "axios";
import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";
import Button from "components/controls/Button";
import ProgressBar from "components/controls/ProgressBar";
import Layout from "components/layout/Layout";
import ProcessedFightCharacter from "components/wcl/ProcessedFightCharacter";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";

const ConsumesPage = (): JSX.Element => {
    const { config } = useConfig();
    const { logData } = useLog();
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingIndex, setLoadingIndex] = useState(0);

    const processConsumes = useCallback(async () => {
        if (loading) return;
        if (!logData.processedReport) return;
        if (!config.keyValid) return;
        setLoading(true);
        setLoadingProgress(0);
        setLoadingIndex(0);

        const engineerCount = logData.processedReport.characters.reduce(
            (acc, cur) => acc + (cur.isEngineer ? 1 : 0),
            0
        );
        const playerCount = logData.processedReport.characters.length;
        const total = engineerCount + playerCount;
        for (let i = 0; i < logData.processedReport.characters.length; i++) {
            setLoadingIndex(i + 1);
            const character = logData.processedReport.characters[i];
            const consumes = (
                await axios.post(`/api/consumes?apiKey=${config.apiKey}&player=${character.name}`)
            ).data;
            console.log(consumes);
            setLoadingIndex(i + 1);
            setLoadingProgress((i + 1) / length);
            setLoadingProgress((i + engineerCount) / total);
            break;
        }
        setLoading(false);
    }, [loading, config.keyValid, config.apiKey, logData.rawReport]);

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
                                <Button onClick={processConsumes}>Load Fights Overview</Button>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {loading && (
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
            )}
            <div className="flex">
                <div className="flex flex-col gap-2 w-full md:w-1/2 md:pr-2">
                    <h2 className="text-xl">Tanks</h2>
                    {logData.processedReport.characters
                        .filter(c => c.mainRole === "tank")
                        .map((c, i) => (
                            <ProcessedFightCharacter
                                key={i}
                                character={c}
                                fights={logData.processedReport?.fights || []}
                            />
                        ))}
                    <h2 className="text-xl mt-4">Healers</h2>
                    {logData.processedReport.characters
                        .filter(c => c.mainRole === "healer")
                        .map((c, i) => (
                            <ProcessedFightCharacter
                                key={i}
                                character={c}
                                fights={logData.processedReport?.fights || []}
                            />
                        ))}
                </div>
                <div className="flex flex-col gap-4 w-full md:w-1/2 md:pl-2">
                    <h2 className="text-xl">DPS</h2>
                    {logData.processedReport.characters
                        .filter(c => c.mainRole === "dps")
                        .map((c, i) => (
                            <ProcessedFightCharacter
                                key={i}
                                character={c}
                                fights={logData.processedReport?.fights || []}
                            />
                        ))}
                </div>
            </div>
        </Layout>
    );
};

export default ConsumesPage;
