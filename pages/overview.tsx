import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import { FaSync } from "react-icons/fa";
import {
    GiCheckMark,
    GiPlainCircle,
    GiSkullCrossedBones,
    GiStopwatch,
} from "react-icons/gi";
import dayjs from "dayjs";
import Button from "components/controls/Button";
import Layout from "components/layout/Layout";
import { WclFight } from "lib/WclTypes";
import useLog from "lib/useLog";
import RawFightTile from "components/wcl/RawFightTile";
import { formatTime } from "lib/text";
import Pill from "components/atoms/Pill";
import useConfig from "lib/useConfig";

const OverviewPage = (): JSX.Element => {
    const { config } = useConfig();
    const { logData, setLogData } = useLog();
    const [loading, setLoading] = useState(false);
    const loadReport = useCallback(async () => {
        if (loading) return;
        if (!logData.reportId) return;
        setLoading(true);
        const result = (
            await axios.get(`/api/report?reportId=${logData.reportId}&apiKey=${config.apiKey}`)
        ).data;
        console.log(result);
        setLogData(cur => ({ ...cur, rawReport: result }));
        setLoading(false);
    }, [loading, config.apiKey, logData.reportId]);

    type FightGroup = {
        name: string;
        start: number;
        end: number;
        wipes: number;
        kill: boolean;
        heroic: boolean;
        fights: WclFight[];
    };

    const groupedFights = useMemo<Record<string, FightGroup>>(() => {
        if (!logData.rawReport) return {};
        const output: Record<string, FightGroup> = {};
        for (let i = 0; i < logData.rawReport.fights.length; i++) {
            const fight: WclFight = logData.rawReport.fights[i];
            const key = fight.name + (fight.difficulty === 3 ? " Normal" : " Heroic");
            if (!output[key])
                output[key] = {
                    name: fight.name,
                    start: fight.start_time,
                    end: fight.end_time,
                    heroic: fight.difficulty === 4,
                    fights: [],
                    wipes: 0,
                    kill: false,
                };
            output[key].fights.push(fight);
            output[key].start = Math.min(output[key].start, fight.start_time);
            output[key].end = Math.max(output[key].end, fight.end_time);
            output[key].fights.sort((a, b) => a.start_time - b.start_time);
            if (fight.kill) output[key].kill = true;
            else output[key].wipes++;
        }
        return output;
    }, [logData.rawReport]);

    if (!logData.reportId) {
        return (
            <Layout>
                <p>No report is loaded</p>
            </Layout>
        );
    }

    if (!logData.rawReport) {
        return (
            <Layout>
                <div className="grid place-items-center h-96">
                    <div className="flex flex-col gap-4 w-1/2 items-center justify-center">
                        {loading ? (
                            <FaSync className="text-4xl animate-spin" />
                        ) : (
                            <>
                                <h1 className="text-2xl">
                                    {config.logs.find(l => l.id === logData.reportId)?.title || ""}
                                </h1>
                                <Button onClick={loadReport}>Load Fights Overview</Button>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl">{logData.rawReport.title}</h1>
                <h2>{dayjs(logData.rawReport.start).format("DD MMMM YY")}</h2>
            </div>
            <div className="flex flex-col gap-4">
                {Object.keys(groupedFights).map(fightName => (
                    <div
                        key={fightName}
                        className="border border-white border-opacity-50 rounded p-4"
                    >
                        <div className="flex gap-4 justify-between">
                            <h2 className="text-2xl flex gap-4 items-center">
                                <span>{groupedFights[fightName].name}</span>
                            </h2>
                            <div className="flex gap-4">
                                {groupedFights[fightName].heroic ? (
                                    <Pill className="text-orange-400 border-orange-400 w-24">
                                        <GiSkullCrossedBones className="relative" /> Heroic
                                    </Pill>
                                ) : (
                                    <Pill className="text-blue-400 border-blue-400 w-24">
                                        <GiPlainCircle className="relative" /> Normal
                                    </Pill>
                                )}
                                <Pill className="border-white w-24">
                                    <GiStopwatch />{" "}
                                    {formatTime(
                                        (groupedFights[fightName].end -
                                            groupedFights[fightName].start) /
                                            1000
                                    )}
                                </Pill>
                                {groupedFights[fightName].wipes > 0 ? (
                                    <Pill className="border-red-400 text-red-400 w-24">
                                        {groupedFights[fightName].wipes} Wipe
                                        {groupedFights[fightName].wipes !== 1 ? "s" : ""}
                                    </Pill>
                                ) : (
                                    <div className="w-24" />
                                )}
                                {groupedFights[fightName].kill && (
                                    <Pill className="border-green-400 text-green-400">
                                        <GiCheckMark /> Kill
                                    </Pill>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4">
                            {groupedFights[fightName].fights.map((f, i) => (
                                <RawFightTile key={f.start_time} fight={f} attempt={i + 1} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
                {/* <div className="flex flex-col gap-4">
                    {report.fights.map(fight => (
                        <div key={fight.id} className="flex flex-col gap-2 p-2 border border-white rounded border-opacity-20">
                            <p>{key} ({fight.kill ? "Kill" : <span className="text-red-400">{`${Math.round((fight.fightPercentage || 0) / 100)}%`}</span>})</p>
                            <p>{fight.boss}</p>
                        </div>
                    ))}
                </div> */}
                {/* <div className="grid grid-cols-2 gap-4">
                    {report.friendlies.map(friendly => (
                        <div key={friendly.id} className="flex flex-col p-2 rounded">
                            <p className="text-lg text-black px-2 font-bold rounded" style={{backgroundColor: ColorUtils.getClassColor(friendly.type)}}>{friendly.name} ({friendly.type})</p>
                            {consumeData[friendly.name] && (
                                <div className="flex gap-4 mt-2">
                                    <p className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-36 text-center" style={{backgroundColor: ColorUtils.getPercentageColor(consumeData[friendly.name].prePot, "40")}}>{Math.round(consumeData[friendly.name].prePot * 100)}% Prepot</p>
                                    <p className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-36 text-center" style={{backgroundColor: ColorUtils.getPercentageColor(consumeData[friendly.name].fightPot, "40")}}>{Math.round(consumeData[friendly.name].fightPot * 100)}% Fight Pot</p>
                                    <p className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-36 text-center" style={{backgroundColor: ColorUtils.getPercentageColor(consumeData[friendly.name].foodPercentage, "40")}}>{Math.round(consumeData[friendly.name].foodPercentage * 100)}% Food</p>
                                    {consumeData[friendly.name].flaskPercentage > consumeData[friendly.name].dualElixirPercentage 
                                        ? <p className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-36 text-center" style={{backgroundColor: ColorUtils.getPercentageColor(consumeData[friendly.name].flaskPercentage, "40")}}>{Math.round(consumeData[friendly.name].flaskPercentage * 100)}% Flask</p>
                                        : <p className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-36 text-center" style={{backgroundColor: ColorUtils.getPercentageColor(consumeData[friendly.name].dualElixirPercentage, "40")}}>{Math.round(consumeData[friendly.name].dualElixirPercentage * 100)}% Elixir</p>
                                    }
                                </div>
                            )}
                        </div>
                    ))}
                </div> */}
            </div>
        </Layout>
    );
};

export default OverviewPage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
