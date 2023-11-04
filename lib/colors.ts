class ColorUtils {
    static getPercentageColor(percentage: number, alphaSuffix?: string): string {
        if (percentage < 0.4) return "#f50f31" + (alphaSuffix || "");
        if (percentage < 0.5) return "#f55c0f" + (alphaSuffix || "");
        if (percentage < 0.6) return "#f5b80f" + (alphaSuffix || "");
        if (percentage < 0.7) return "#eaf50f" + (alphaSuffix || "");
        if (percentage < 0.8) return "#82f50f" + (alphaSuffix || "");
        if (percentage < 0.9) return "#17e300" + (alphaSuffix || "");
        return "#00e39b" + (alphaSuffix || "");
    }
    static getClassColor(className: string, alphaSuffix?: string): string {
        switch (className) {
            case "DeathKnight":
                return "#C41E3A" + (alphaSuffix || "");
            case "DemonHunter":
                return "#A330C9" + (alphaSuffix || "");
            case "Druid":
                return "#FF7C0A" + (alphaSuffix || "");
            case "Evoker":
                return "#33937F" + (alphaSuffix || "");
            case "Hunter":
                return "#AAD372" + (alphaSuffix || "");
            case "Mage":
                return "#3FC7EB" + (alphaSuffix || "");
            case "Monk":
                return "#00FF98" + (alphaSuffix || "");
            case "Paladin":
                return "#F48CBA" + (alphaSuffix || "");
            case "Priest":
                return "#FFFFFF" + (alphaSuffix || "");
            case "Rogue":
                return "#FFF468" + (alphaSuffix || "");
            case "Shaman":
                return "#0070DD" + (alphaSuffix || "");
            case "Warlock":
                return "#8788EE" + (alphaSuffix || "");
            case "Warrior":
                return "#C69B6D" + (alphaSuffix || "");
        }
        return "#FFFFFF" + (alphaSuffix || "");
    }
}

export default ColorUtils;
