import React, { createContext, ReactNode, useContext, useState } from "react";
import { ProcessedReport, WclConsumeData, WclReport } from "./WclTypes";

type SettableValue<S> = {
    logData: S, 
    setLogData: (action: S | ((prevState: S) => S)) => void
};

export type LogData = {
    reportId?: string,
    rawReport?: WclReport,
    processedReport?: ProcessedReport,
    consumeData?: Record<string, WclConsumeData>,
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
    const [logData, setLogData] = useState<LogData>(initialValue)
    return <logContext.Provider value={{logData, setLogData}}>{children}</logContext.Provider>;
};

const useLog = () => {
    const context = useContext(logContext);
    return context;
};

export { LogContextProvider };
export default useLog;
