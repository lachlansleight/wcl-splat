import axios from "axios";
import Button from "components/controls/Button";
import TextField from "components/controls/TextField";
import Layout from "components/layout/Layout";
import dayjs from "dayjs";
import { WclReportMetadata } from "lib/WclTypes";
import { formatTime } from "lib/text";
import useConfig from "lib/useConfig";
import useLog from "lib/useLog";
import { useCallback, useState } from "react";
import { FaSync } from "react-icons/fa";


const LogsPage = (): JSX.Element => {

    const [newLogId, setNewLogId] = useState("");
    const {config, setConfig} = useConfig();
    const {logData, setLogData} = useLog();
    const [loading, setLoading] = useState(false);

    const addNewLog = useCallback(async () => {
        if(config.logs.findIndex(l => l.id === newLogId)) {
            //window.alert("Log already exists!");
            //return;
        }
        if(loading) return;
        if(!config.keyValid) {
            window.alert("API key not valid!");
            return;
        }
        setLoading(true);
        const rawReport = (await axios(`/api/report?apiKey=${config.apiKey}&reportId=${newLogId}`)).data;
        const metadata: WclReportMetadata = {
            id: newLogId,
            start: rawReport.start,
            end: rawReport.end,
            title: rawReport.title,
            owner: rawReport.owner,
            fightCount: rawReport.fights.length
        };
        setConfig(cur => ({...cur, logs: [...cur.logs, metadata]}));
        setNewLogId("");
        setLoading(false);
    }, [loading, newLogId]);

    return (
        <Layout>
            <h1 className="text-2xl">Your Logs</h1>
            <div className="my-2 flex flex-col text-lg">
                <div className="flex gap-4 justify-end items-center h-8 border-b border-white border-opacity-20 font-bold">
                    <p className="flex-grow">Title</p>
                    <p className="w-48">Date</p>
                    <p className="w-24">Length</p>
                    <p className="w-12">Fights</p>
                    <p className="w-24">&nbsp;</p>
                    <p className="w-24">&nbsp;</p>
                </div>
                {loading ? (
                    <div className="flex gap-2 items-center">
                        <p>{newLogId}</p>
                        <FaSync className="animate-spin" />
                    </div>
                ) : config.logs.length === 0 ? (
                    <div className="flex gap-2 items-center">
                        <p>You have no logs saved to this browser. Add one to get started!</p>
                    </div>
                ) : null}
                {config.logs.map((log, i) => (
                    <div key={i} className="flex gap-4 justify-end items-center h-16">
                        <p className="flex items-center h-full flex-grow">{log.title}</p>
                        <p className="flex items-center h-full w-48">{dayjs(log.start).format("DD MMMM YY")}</p>
                        <p className="flex items-center h-full w-24">{formatTime((log.end - log.start) / 1000)}</p>
                        <p className="flex items-center h-full w-12">{log.fightCount}</p>
                        {logData.reportId === log.id ? (
                            <p className="w-24 grid place-items-center border-green-400 border border-opacity-20 rounded text-green-400 h-10 select-none">Active</p>
                        ) : (
                            <Button onClick={() => setLogData(cur => ({reportId: log.id}))} className="mt-0 w-24">Open</Button>
                        )}
                        <Button onClick={() => {
                            if(!window.confirm("Really delete this log?")) return;
                            setConfig(cur => ({...cur, logs: cur.logs.filter(l => l.id !== log.id)}));
                            if(logData.reportId === log.id) {
                                setLogData({});
                            }
                        }} className="mt-0 w-24 bg-red-500">Delete</Button>
                    </div>
                ))}
            </div>
            <TextField label="Log ID" value={newLogId} onChange={v => setNewLogId(v)} />
            <Button disabled={newLogId === ""} onClick={addNewLog}>Add Log</Button>
        </Layout>
    )
}

export default LogsPage;