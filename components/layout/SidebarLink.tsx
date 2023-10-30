import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import {
    MdError,
    MdChangeHistory,
} from "react-icons/md";
import {
    GiBigGear,
    GiCharacter,
    GiChestArmor,
    GiCrossedSwords,
    GiHouse,
    GiMagnifyingGlass,
    GiNotebook,
    GiRoundBottomFlask
} from "react-icons/gi";

const GetIcon = (path: string): JSX.Element => {
    const iconClassName = "text-3xl";

    switch (path) {
        case "":
            return <GiHouse className={iconClassName} />;
        case "home":
            return <GiHouse className={iconClassName} />;
        case "config":
            return <GiBigGear className={iconClassName} />;
        case "logs":
            return <GiNotebook className={iconClassName} />;
        case "overview":
            return <GiMagnifyingGlass className={iconClassName} />;
        case "characters":
            return <GiCharacter className={iconClassName} />;
        case "consumes":
            return <GiRoundBottomFlask className={iconClassName} />;
        case "gear":
            return <GiChestArmor className={iconClassName} />;
        case "fights":
            return <GiCrossedSwords className={iconClassName} />;
        case "changelog":
            return <MdChangeHistory className={iconClassName} />;
    }

    if (path.includes("github")) return <FaGithub className={iconClassName} />;

    return <MdError className={iconClassName} />;
};

const SidebarLink = ({ path, label, textColor = "text-white" }: { path: string; label: string, textColor?: string}): JSX.Element => {
    const router = useRouter();
    const fullPath = router.pathname.includes("app/")
        ? "/app/" + String(router.query.app)
        : router.pathname;
    return (
        <Link
            href={path.includes("://") ? path : `/${path}`}
            target={path.includes("://") ? "_blank" : ""}
        >
            <div className={`flex items-center py-2 px-4 gap-4 hover:bg-neutral-700 select-none cursor-pointer h-12 ${
                fullPath === `/${path}`
                    ? "bg-neutral-900 shadow-inner border-b border-neutral-700"
                    : "bg-transparent"
            } transition-all ${textColor}`}>
                {GetIcon(path)}
                <span className="inline md:hidden lg:inline">{label}</span>
            </div>
        </Link>
    );
};

export default SidebarLink;
