import { useMemo } from "react";
import { ProcessedCharacter, ProcessedFight, WclBombData, WclConsumeData } from "lib/WclTypes";
import ColorUtils from "lib/colors";
import { getShortNumber } from "lib/text";
import Pill from "components/atoms/Pill";

const ProcessedFightCharacter = ({
    character, 
    fights,
    consumes,
    bombs,
}: {
    character: ProcessedCharacter, 
    fights: ProcessedFight[],
    consumes?: WclConsumeData,
    bombs?: WclBombData,
}): JSX.Element => {

    const [damageDone, healingDone] = useMemo(() => {
        let damage = 0;
        let healing = 0;
        fights.forEach(fight => {
            const asDps = fight.dps.find(dps => dps.name === character.name);
            const asHealer = fight.healers.find(healer => healer.name === character.name);
            const asTank = fight.tanks.find(tank => tank.name === character.name);
            damage += asDps?.damageDone || 0;
            damage += asHealer?.damageDone || 0;
            damage += asTank?.damageDone || 0;
            healing += asDps?.healingDone || 0;
            healing += asHealer?.healingDone || 0;
            healing += asTank?.healingDone || 0;
        });
        return [damage, healing];
    }, [character, fights]);

    const bombPercentage = useMemo(() => {
        if(!bombs) return 0;

        let maxCount = 0;
        for(let i = 0; i < fights.length; i++) {
            maxCount += 1 + Math.floor((fights[i].end - fights[i].start) / 60000);
        }
        if(maxCount === 0) return 1;
        return ((bombs.bombs || 0) + (bombs.sappers || 0)) / (maxCount * 0.8);
    }, [fights, bombs]);


    return (
        <div className="flex items-center gap-4">
            <div className="text-black py-1 px-2 leading-none w-72 rounded" style={{
                backgroundColor: ColorUtils.getClassColor(character.class),
            }}>
                <span className="font-bold">{character.name}</span><br/><span>{character.specs[0]} {character.class === "DeathKnight" ? "DK" : character.class}</span>
            </div>
            <div className="w-4" />
            {character.mainRole === "tank" && <div className="w-20" />}
            {character.mainRole === "dps" && <Pill className="border-white w-20">{getShortNumber(damageDone)}</Pill>}
            {character.mainRole === "healer" && <Pill className="border-white w-20">{getShortNumber(healingDone)}</Pill>}
            <div className="w-4" />
            {consumes && (
                <>
                    <Pill className="border-white w-12" percentage={consumes.prePot} percentageOpacity="40">{Math.round(consumes.prePot * 100)}%</Pill>
                    <Pill className="border-white w-12" percentage={consumes.fightPot} percentageOpacity="40">{Math.round(consumes.fightPot * 100)}%</Pill>
                    <Pill className="border-white w-12" percentage={consumes.foodPercentage} percentageOpacity="40">{Math.round(consumes.foodPercentage * 100)}%</Pill>
                    {consumes.usesElixirs 
                        ? <Pill className="border-white w-12" percentage={consumes.dualElixirPercentage} percentageOpacity="40">{Math.round(consumes.dualElixirPercentage * 100)}%</Pill>
                        : <Pill className="border-white w-12" percentage={consumes.flaskPercentage} percentageOpacity="40">{Math.round(consumes.flaskPercentage * 100)}%</Pill>
                    }
                </>
            )}
            <div className="w-4" />
            {(bombs && character.isEngineer) ? (
                <>
                    <Pill className="border-white w-12" percentage={bombPercentage} percentageOpacity="40">{bombs.bombs || 0}</Pill>
                    <Pill className="border-white w-12" percentage={bombPercentage} percentageOpacity="40">{bombs.sappers || 0}</Pill>
                </>
            ) : (
                <>
                    <div className="w-12" />
                    <div className="w-12" />
                </>
            )}
        </div>
    )
}

export default ProcessedFightCharacter;