import { ReactNode } from "react";


const Pill = ({
    className = "", 
    children = null,
}: {
    className?: string,
    children?: ReactNode
}): JSX.Element => {
    return (
        <div className={`px-2 border border-opacity-20 rounded flex gap-2 items-center ${className}`}>
            {children}
        </div>
    )
}

export default Pill;