import { ReactNode } from "react";

const ProgressBar = ({
    children = null,
    progress,
    containerClassName = "",
    className = "",
    color = "grey",
}: {
    children?: ReactNode;
    progress: number;
    containerClassName?: string;
    className?: string;
    color?: string;
}): JSX.Element => {
    return (
        <div className={`relative ${containerClassName}`}>
            <div
                className="absolute left-0 top-0 z-0 h-full"
                style={{
                    backgroundColor: color,
                    width: `${progress * 100}%`,
                    transition: "all 0.3s",
                }}
            />
            <div className={`relative ${className}`}>{children}</div>
        </div>
    );
};

export default ProgressBar;
