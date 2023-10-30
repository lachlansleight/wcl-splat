import { ProcessedFight, WclFight } from "lib/WclTypes";
import { formatTime } from "lib/text";


const RawFightTile = ({fight, attempt}: {fight: WclFight, attempt: number}): JSX.Element => {
    
    return (
        <div className="rounded flex flex-col w-[45%] md:w-[30%]">
            <div className="flex justify-between items-center">
                <h3 className="text-lg">Attempt #{attempt}</h3>
                <p>{formatTime((fight.end_time - fight.start_time) / 1000)}</p>
            </div>
            <div className="w-full h-6 rounded relative border border-white border-opacity-20">
                <div className="bg-red-500 bg-opacity-10 h-full rounded absolute left-0 top-0" style={{
                    width: `${(fight.fightPercentage || 0) / 100}%`
                }} />
                <p className={`absolute left-0 top-0 w-full h-full text-center ${fight.kill ? "text-green-400" : "text-white"}`}>{fight.kill ? "Kill" : `Wipe at ${Math.round(0.01 * (fight.fightPercentage || 0))}%`}</p>
            </div>
        </div>
    )
}

export default RawFightTile;