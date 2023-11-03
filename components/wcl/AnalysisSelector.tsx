import { useMemo } from "react";
import { AnalysisFightSelection, AnalysisTableName, ProcessedReport, prettyTableNames, tableNames } from "lib/WclTypes";


const AnalysisSelector = ({
    processedReport,
    boss,
    onBossChange,
    table,
    onTableChange,
    fight,
    onFightChange,
}: {
    processedReport: ProcessedReport,
    boss: number,
    onBossChange: (newVal: number) => void,
    table: AnalysisTableName,
    onTableChange: (newVal: AnalysisTableName) => void,
    fight: AnalysisFightSelection,
    onFightChange: (newVal: AnalysisFightSelection) => void,
}): JSX.Element => {

    const bosses = useMemo(() => {
        const bosses: {id: number, name: string}[] = [];
        processedReport.fights.forEach(f => {
            if(f.boss === 847) return; //no gunship
            if(!bosses.find(b => b.name === f.name)) bosses.push({id: f.boss, name: f.name});
        });
        bosses.sort((a, b) => a.id - b.id);
        return bosses;
    }, [processedReport]);

    const fights = useMemo(() => {
        const f = processedReport.fights.filter(f => f.boss === boss);
        return f.map((f, i) => ({id: f.id, attempt: (i + 1), kill: f.kill}));
    }, [processedReport, boss]);

    return (
        <div className="flex flex-col gap-4 h-64 border-b border-white">
            <div className="flex items-start gap-4">
                <h2 className="text-2xl w-32 shrink-0">Boss</h2>
                <div className="flex flex-wrap gap-2">
                    {bosses.map(b => (
                        <div 
                            key={b.id}
                            className={`grid place-items-center text-lg px-2 py-1 cursor-pointer border border-white rounded ${boss === b.id ? "border-opacity-20 bg-blue-900 bg-opacity-50" : "border-opacity-20"}`}
                            onClick={() => {
                                if(boss === b.id) return;
                                onBossChange(b.id);
                                onTableChange(tableNames[b.id][0]);
                            }}
                        >{b.name}</div>
                    ))}
                </div>
            </div>
            {boss !== 0 && (
                <>
                <div className="flex items-start gap-4">
                    <h2 className="text-2xl w-32 shrink-0">Attempt</h2>
                    {fights.length > 1 ? (
                        <div className="flex flex-wrap gap-2">
                            <div 
                                className={`grid place-items-center text-lg px-2 py-1 cursor-pointer border border-white rounded ${fight === "all" ? "border-opacity-20 bg-blue-900 bg-opacity-50" : "border-opacity-20"}`}
                                onClick={() => {
                                    if(fight === "all") return;
                                    onFightChange("all");
                                }}
                            >All</div>
                            {fights.map(f => (
                                <div 
                                    key={f.id}
                                    className={`grid place-items-center text-lg px-2 py-1 cursor-pointer border border-white rounded ${fight === f.id ? "border-opacity-20 bg-blue-900 bg-opacity-50" : "border-opacity-20"}`}
                                    onClick={() => {
                                        if(fight === f.id) return;
                                        onFightChange(f.id);
                                    }}
                                >Attempt #{f.attempt}{f.kill ? " (Kill)" : ""}</div>
                            ))}
                        </div>
                    ) : (
                        <div 
                            className={`grid place-items-center text-lg px-2 py-1 cursor-pointer border border-white rounded border-opacity-20 bg-blue-900 bg-opacity-50`}
                        >Attempt #1 (Kill)</div>
                    )}
                </div>
                <div className="flex items-start gap-4">
                    <h2 className="text-2xl w-32 shrink-0">Metric</h2>
                    <div className="flex flex-wrap gap-2">
                        {tableNames[boss].map(t => (
                            <div 
                                key={t}
                                className={`grid place-items-center text-lg px-2 py-1 cursor-pointer border border-white rounded ${table === t ? "border-opacity-20 bg-blue-900 bg-opacity-50" : "border-opacity-20"}`}
                                onClick={() => {
                                    if(table === t) return;
                                    onTableChange(t);
                                }}
                            >{prettyTableNames[t]}</div>
                        ))}
                    </div>
                </div>
                </>
            )}
        </div>
    )
}

export default AnalysisSelector;