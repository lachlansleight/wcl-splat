export const formatTime = (seconds: number): string => {
    if (!seconds) return "00:00";
    seconds = Math.round(seconds);
    let output = "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds %= 60;
    if (hours > 1) output += hours + ":";
    if (minutes >= 10) output += minutes + ":";
    else if (minutes > 0 && hours > 0) output += "0" + minutes + ":";
    else if (minutes > 0 && hours === 0) output += minutes + ":";
    else if (minutes === 0) output += "00:";
    if (seconds >= 10) output += seconds;
    else if (seconds > 0) output += "0" + seconds;
    else output += "00";
    return output;
};

export const getShortNumber = (value: number, decimals = 0) => {
    if (value === 0) return "0";
    if (value < 1000) return value.toFixed(decimals);
    if (value < 1000000) return `${(value / 1000).toFixed(decimals)}k`;
    return `${(value / 1000000).toFixed(decimals)}M`;
};

/** Turns a short number (e.g. 5k) into a number (5000) */
export const parseShortNumber = (value: string): number => {
    if (value.includes("M")) {
        return Math.round(Number(value.replace("M", "")) * 1000000);
    } else if (value.includes("k")) {
        return Math.round(Number(value.replace("k", "")) * 1000);
    } else {
        return Math.round(Number(value));
    }
};
