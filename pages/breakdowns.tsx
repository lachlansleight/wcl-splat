import axios from "axios";
import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";
import Button from "components/controls/Button";
import ProgressBar from "components/controls/ProgressBar";
import Layout from "components/layout/Layout";
import WCL from "lib/WCL";
import { AnalysisFightSelection, AnalysisTableName, ProcessedFight, ProcessedReport, WclBombData } from "lib/WclTypes";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";
import AnalysisSelector from "components/wcl/AnalysisSelector";

const CharactersPage = (): JSX.Element => {

    const {config} = useConfig();
    const {logData, setLogData} = useLog();

    const [boss, setBoss] = useState(0);
    const [table, setTable] = useState<AnalysisTableName>("acidBurst");
    const [fight, setFight] = useState<AnalysisFightSelection>("all");

    const [loading, setLoading] = useState("");
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingIndex, setLoadingIndex] = useState(0);

    const [tempData, setTempData] = useState<any>({});

    const processMarrowgar = async () => {
        setLoading("marrowgar");
        setLoadingProgress(0);

    }

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
                <p>You need to prepare the base character overview before you can do fight breakdowns</p>
            </Layout>
        )
    }

    return (
        <Layout>
            {loading ? (
                <div className="w-full flex flex-col items-center gap-2">
                    <FaSync className="text-4xl animate-spin" />
                    <ProgressBar progress={loadingProgress} containerClassName="h-8 border border-white rounded w-full grid place-items-center" color="#4ade8040">
                        Processed&nbsp;
                        {loading === "base" ? "encounter" : loading === "consumes" ? "player" : "encounter"} {loadingIndex} of&nbsp;
                        {loading === "base" ? logData.rawReport?.fights?.length || 0 : loading === "consumes" ? logData.processedReport?.characters?.length || 0 : logData.processedReport?.fights.length || 0}
                    </ProgressBar>
                </div>
            ) : (
                <AnalysisSelector processedReport={logData.processedReport} boss={boss} onBossChange={setBoss} table={table} onTableChange={setTable} fight={fight} onFightChange={setFight} />
            )}
            
            <div className="flex flex-col gap-2">
                <Button onClick={() => {
                    if(!logData.processedReport) return;
                    WCL.getAnalysisPage(config.apiKey, logData.processedReport, boss, table).then((data => {
                        console.log(data);
                        setTempData(data);
                    }));
                }}>Test</Button>
                <pre>{JSON.stringify(tempData, null, 2)}</pre>
            </div>
        </Layout>
    )
}

export default CharactersPage;