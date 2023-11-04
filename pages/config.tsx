import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";
import axios from "axios";
import TextField from "components/controls/TextField";
import Layout from "components/layout/Layout";
import Button from "components/controls/Button";
import useConfig from "lib/useConfig";

const ConfigPage = (): JSX.Element => {
    const { config, setConfig } = useConfig();
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState("");

    const runTest = useCallback(async () => {
        if (loading) return;
        if (!config.apiKey) {
            setTestResult("Error: No API key provided");
            setConfig(cur => ({ ...cur, keyValid: false }));
            return;
        }
        setLoading(true);
        setTestResult("");
        try {
            const response = (
                await axios(`/api/report?apiKey=${config.apiKey}&reportId=4ZdWAv6FgrzwnkpT`)
            ).data;
            console.log(response);
            setTestResult("API key functionality confirmed!");
            setConfig(cur => ({ ...cur, keyValid: true }));
            setLoading(false);
        } catch (e: any) {
            console.log("Error: ", e);
            setTestResult("Error: Failed to get data from WCL - " + e.message);
            setConfig(cur => ({ ...cur, keyValid: false }));
            setLoading(false);
        }
    }, [loading, config.apiKey]);

    return (
        <Layout>
            <div className="grid place-items-center h-96">
                <div className="flex flex-col gap-4 w-1/2 justify-center">
                    <p>You will need to provide your own WarcraftLogs API key to use this tool.</p>
                    <p>
                        To obtain one, go to{" "}
                        <a
                            className="underline text-green-400"
                            href="https://classic.warcraftlogs.com/profile"
                            target="_blank"
                            rel="noreferrer"
                        >
                            your warcraftlogs profile page
                        </a>
                        , scroll to the bottom and follow the instructions under the &quot;Web
                        API&quot; heading.
                    </p>
                    <p>
                        Copy-and-paste your API key into the text box below, then click Test to make
                        sure you did it correctly. It will be saved to your browser&apos;s local
                        storage so you don&apos;t have to paste it every time.
                    </p>
                    <TextField
                        label="WarcraftLogs API Key"
                        value={config.apiKey}
                        onChange={v => setConfig(cur => ({ ...cur, apiKey: v }))}
                    />
                    {loading ? (
                        <div className="flex gap-4 items-center justify-center w-full h-9 mt-4 border border-white border-opacity-10 rounded text-lg">
                            <FaSync className="animate-spin" />
                            <span>Running Test...</span>
                        </div>
                    ) : (
                        <Button onClick={() => runTest()}>Test API Key</Button>
                    )}
                    {testResult.includes("Error") ? (
                        <p className="text-red-300 text-center">{testResult}</p>
                    ) : testResult ? (
                        <p className="text-green-300 text-center">{testResult}</p>
                    ) : (
                        <p>&nbsp;</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ConfigPage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
