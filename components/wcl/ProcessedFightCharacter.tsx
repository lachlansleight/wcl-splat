import { ProcessedCharacter, ProcessedFight } from "lib/WclTypes";
import ColorUtils from "lib/colors";
import { getShortNumber } from "lib/text";
import { useMemo } from "react";


const ProcessedFightCharacter = ({character, fights}: {character: ProcessedCharacter, fights: ProcessedFight[]}): JSX.Element => {

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


    return (
        <div>
            <div className="flex justify-between text-black font-bold text-lg rounded-tl rounded-tr px-4" style={{
                backgroundColor: ColorUtils.getClassColor(character.class),
            }}>
                <span>{character.name}</span>
                <span>{character.specs[0]} {character.class}</span>
            </div>
            <div className="p-[0.5px] pb-2 rounded-br rounded-bl border border-white border-opacity-20">
                <div className="flex flex-col gap-2 px-4">
                    {character.mainRole === "dps" && <p>Damage: {getShortNumber(damageDone)}</p>}
                    {character.mainRole === "healer" && <p>Healing: {getShortNumber(healingDone)}</p>}
                </div>
            </div>
        </div>
    )
}

export default ProcessedFightCharacter;