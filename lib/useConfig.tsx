import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { WclReportMetadata } from "./WclTypes";

type SettableValue<S> = {
    config: S;
    setConfig: (action: S | ((prevState: S) => S)) => void;
};

export type ConfigData = {
    apiKey: string;
    keyValid: boolean;
    logs: WclReportMetadata[];
};

const logContext = createContext<SettableValue<ConfigData>>({
    config: {
        apiKey: "",
        keyValid: false,
        logs: [],
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setConfig: () => {},
});

const ConfigContextProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<ConfigData>({
        apiKey: "",
        keyValid: false,
        logs: [],
    });

    useEffect(() => {
        const storedConfig = localStorage.getItem("config");
        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            parsedConfig.logs?.sort((a: any, b: any) => a.start - b.start);
            setConfig(parsedConfig);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("config", JSON.stringify(config));
    }, [config]);

    return <logContext.Provider value={{ config, setConfig }}>{children}</logContext.Provider>;
};

const useConfig = () => {
    const context = useContext(logContext);
    return context;
};

export { ConfigContextProvider };
export default useConfig;
