import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
    ProcessedReport,
    WclBombData,
    WclConsumeData,
    WclFullAnalysis,
    WclReport,
} from "./WclTypes";

type SettableValue<S> = {
    logData: S;
    setLogData: (action: S | ((prevState: S) => S)) => void;
};

export type LogData = {
    reportId?: string;
    rawReport?: WclReport;
    processedReport?: ProcessedReport;
    consumeData?: Record<string, WclConsumeData>;
    bombData?: Record<string, WclBombData>;
    fullAnalysis?: WclFullAnalysis;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const logContext = createContext<SettableValue<LogData>>({ logData: {}, setLogData: () => {} });

const LogContextProvider = ({
    children,
    initialValue,
}: {
    children: ReactNode;
    initialValue: LogData;
}) => {
    const [logData, setLogData] = useState<LogData>(initialValue);

    useEffect(() => {
        if (!logData.reportId) return;
        const data = localStorage.getItem("reports/" + logData.reportId);
        if (!data) return;
        setLogData(JSON.parse(data));
    }, [logData.reportId]);

    useEffect(() => {
        if (!logData.reportId) return;
        localStorage.setItem("reports/" + logData.reportId, JSON.stringify(logData));
    }, [logData]);

    return <logContext.Provider value={{ logData, setLogData }}>{children}</logContext.Provider>;
};

const useLog = () => {
    const context = useContext(logContext);
    return context;
};

export { LogContextProvider };
export default useLog;
