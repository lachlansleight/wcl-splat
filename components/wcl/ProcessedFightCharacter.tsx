import { useMemo } from "react";
import { ProcessedCharacter, ProcessedFight, WclBombData, WclConsumeData } from "lib/WclTypes";
import ColorUtils from "lib/colors";
import { getShortNumber } from "lib/text";

const ProcessedFightCharacter = ({
    character,
    fights,
    consumes,
    bombs,
}: {
    character: ProcessedCharacter;
    fights: ProcessedFight[];
    consumes?: WclConsumeData;
    bombs?: WclBombData;
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
        if (!bombs) return 1;

        let maxCount = 0;
        for (let i = 0; i < fights.length; i++) {
            maxCount += 1 + Math.floor((fights[i].end - fights[i].start) / 60000);
        }
        return (bombs.bombs + bombs.sappers) / (maxCount * 0.8);
    }, [fights, bombs]);

    return (
        <div>
            <div
                className="flex justify-between text-black font-bold text-lg rounded-tl rounded-tr px-4"
                style={{
                    backgroundColor: ColorUtils.getClassColor(character.class),
                }}
            >
                <span>{character.name}</span>
                <span>
                    {character.specs[0]} {character.class}
                </span>
            </div>
            <div className="p-[0.5px] pb-2 rounded-br rounded-bl border border-white border-opacity-20">
                <div className="flex flex-col gap-2 px-4">
                    {character.mainRole === "dps" && <p>Damage: {getShortNumber(damageDone)}</p>}
                    {character.mainRole === "healer" && (
                        <p>Healing: {getShortNumber(healingDone)}</p>
                    )}
                    {consumes && (
                        <div className="flex gap-4 mt-2 text-sm">
                            <p
                                className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                style={{
                                    backgroundColor: ColorUtils.getPercentageColor(
                                        consumes.prePot,
                                        "40"
                                    ),
                                }}
                            >
                                {Math.round(consumes.prePot * 100)}% Prepot
                            </p>
                            <p
                                className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                style={{
                                    backgroundColor: ColorUtils.getPercentageColor(
                                        consumes.fightPot,
                                        "40"
                                    ),
                                }}
                            >
                                {Math.round(consumes.fightPot * 100)}% Fight Pot
                            </p>
                            <p
                                className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                style={{
                                    backgroundColor: ColorUtils.getPercentageColor(
                                        consumes.foodPercentage,
                                        "40"
                                    ),
                                }}
                            >
                                {Math.round(consumes.foodPercentage * 100)}% Food
                            </p>
                            {consumes.usesElixirs ? (
                                <p
                                    className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                    style={{
                                        backgroundColor: ColorUtils.getPercentageColor(
                                            consumes.dualElixirPercentage,
                                            "40"
                                        ),
                                    }}
                                >
                                    {Math.round(consumes.dualElixirPercentage * 100)}% Elixir
                                </p>
                            ) : (
                                <p
                                    className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                    style={{
                                        backgroundColor: ColorUtils.getPercentageColor(
                                            consumes.flaskPercentage,
                                            "40"
                                        ),
                                    }}
                                >
                                    {Math.round(consumes.flaskPercentage * 100)}% Flask
                                </p>
                            )}
                        </div>
                    )}
                    {bombs && character.isEngineer && (
                        <div className="flex gap-4 mt-2 text-sm">
                            <p
                                className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                style={{
                                    backgroundColor: ColorUtils.getPercentageColor(
                                        bombPercentage,
                                        "40"
                                    ),
                                }}
                            >
                                {Math.round(bombs.bombs)} Bombs
                            </p>
                            <p
                                className="px-1 border border-white rounded border-opacity-10 bg-black bg-opacity-30 w-28 text-center"
                                style={{
                                    backgroundColor: ColorUtils.getPercentageColor(
                                        bombPercentage,
                                        "40"
                                    ),
                                }}
                            >
                                {Math.round(bombs.sappers)} Sappers
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessedFightCharacter;
