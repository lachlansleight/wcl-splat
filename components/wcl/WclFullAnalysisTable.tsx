import ColorUtils from "lib/colors";
import { getShortNumber } from "lib/text";

const WclFullAnalysisTable = ({ processedData }: { processedData: any }): JSX.Element => {
    return (
        <div className="flex flex-col gap-2">
            {processedData?.players?.map((player: any) => {
                return (
                    <div key={player.id} className="flex gap-2 h-12">
                        <div
                            className="flex items-center text-white border-2 h-full py-1 px-2 leading-none w-72 rounded"
                            style={{
                                borderColor: ColorUtils.getClassColor(player.class),
                                color: ColorUtils.getClassColor(player.class),
                            }}
                        >
                            <div>
                                <span className="font-bold">{player.name}</span>
                                <br />
                                <span>
                                    {player.specs[0]}{" "}
                                    {player.class === "DeathKnight" ? "DK" : player.class}
                                </span>
                            </div>
                        </div>
                        <div className="flex-grow h-full relative">
                            <div
                                className="absolute left-0 top-0 rounded h-full"
                                style={{
                                    backgroundColor: ColorUtils.getClassColor(player.class),
                                    width: `${player.normalized * 100}%`,
                                }}
                            />
                            <div
                                className={`absolute top-0 flex flex-col items-center justify-center text-lg h-full font-bold leading-none`}
                                style={{
                                    color: player.normalized < 0.1 ? "white" : "black",
                                    left:
                                        player.normalized < 0.1
                                            ? `calc(${player.normalized * 100}% + 0.5rem)`
                                            : undefined,
                                    right:
                                        player.normalized < 0.1
                                            ? undefined
                                            : `calc(${(1 - player.normalized) * 100}% + 0.5rem)`,
                                    textAlign: player.normalized < 0.1 ? "left" : "right",
                                }}
                            >
                                <div>
                                    {processedData.type === "damage-done" && (
                                        <span>{getShortNumber(player.damage, 1)}</span>
                                    )}
                                    {processedData.type === "damage-taken" && (
                                        <>
                                            <span>{getShortNumber(player.damage, 1)}</span>
                                            <br />
                                            <span>{player.ticks} Ticks</span>
                                        </>
                                    )}
                                    {processedData.type === "actions-performed" && (
                                        <span>{player.actions}</span>
                                    )}
                                    {processedData.type === "debuff-stacks" && (
                                        <>
                                            <span>{player.maxStacks} Max Stacks</span>
                                            <br />
                                            <span>{player.totalStacks} Total Stacks</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default WclFullAnalysisTable;
