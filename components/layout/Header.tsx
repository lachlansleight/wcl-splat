import { FaBars } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import React from "react";
import packageJson from "package.json";

const Header = ({
    open,
    onToggleOpen,
}: {
    open: boolean;
    onToggleOpen: () => void;
}): JSX.Element => {
    return (
        <div className="flex flex-col bg-neutral-800 py-2 shadow-lg gap-2">
            <div className="flex justify-between h-6">
                <div className="w-60 flex items-center px-5 md:border-r border-neutral-700">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xl text-primary-400">SPLAT</span>
                        <span className="text-white text-sm">v{packageJson.version}</span>
                    </div>
                </div>
                <div className="flex md:flex-grow items-center justify-between gap-5 px-5">
                    <div className="flex-grow" />
                    <div className="flex">
                    </div>
                </div>
            </div>
            <div className="flex md:hidden px-4 gap-4 h-6">
                <button onClick={onToggleOpen}>
                    {open ? (
                        <MdClose className="text-white text-2xl" />
                    ) : (
                        <FaBars className="text-white text-2xl" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Header;
