import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { WclReportMetadata } from "./WclTypes";

type SettableValue<S> = {
    config: S, 
    setConfig: (action: S | ((prevState: S) => S)) => void
};

export type ConfigData = {
    apiKey: string,
    keyValid: boolean,
    logs: WclReportMetadata[],
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const logContext = createContext<SettableValue<ConfigData>>({ config: {
    apiKey: "",
    keyValid: false,
    logs: [],
}, setConfig: () => {} });

const ConfigContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [config, setConfig] = useState<ConfigData>({
        apiKey: "",
        keyValid: false,
        logs: [],
    })

    useEffect(() => {
        const storedConfig = localStorage.getItem("config");
        if(storedConfig) {
            setConfig(JSON.parse(storedConfig));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("config", JSON.stringify(config));
    }, [config]);

    return <logContext.Provider value={{config, setConfig}}>{children}</logContext.Provider>;
};

const useConfig = () => {
    const context = useContext(logContext);
    return context;
};

export { ConfigContextProvider };
export default useConfig;
