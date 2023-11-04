import { ReactNode } from "react";
import ColorUtils from "lib/colors";

const Pill = ({
    className = "",
    children = null,
    percentage,
    percentageOpacity,
}: {
    className?: string;
    children?: ReactNode;
    percentage?: number;
    percentageOpacity?: string;
}): JSX.Element => {
    return (
        <div
            className={`px-2 border border-opacity-20 rounded flex gap-2 items-center justify-center ${className}`}
            style={
                percentage != null
                    ? {
                          backgroundColor: ColorUtils.getPercentageColor(
                              percentage,
                              percentageOpacity
                          ),
                      }
                    : undefined
            }
        >
            {children}
        </div>
    );
};

export default Pill;
