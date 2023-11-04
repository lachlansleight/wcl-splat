class GemUtils {
    static getMetaGemRequirements(id: number): { red: number; blue: number; yellow: number } {
        switch (id) {
            case 41380:
            case 41377:
                return { red: 1, blue: 2, yellow: 0 };
            case 41397:
                return { red: 0, blue: 3, yellow: 0 };
            case 41398:
                return { red: 1, blue: 1, yellow: 1 };
            case 41285:
                return { red: 0, blue: 2, yellow: 0 };
            case 32410:
                return { red: 2, blue: 2, yellow: 2 };
            case 41339:
                return { red: 1, blue: 0, yellow: 2 };
            case 41401:
                return { red: 1, blue: 0, yellow: 1 };
            case 41333:
                return { red: 3, blue: 0, yellow: 0 };
        }
        return { red: 0, blue: 0, yellow: 0 };
    }

    static getEnchantValid(id: number): boolean {
        const validIds = [
            44878, 44957, 44471, 37347, 60663, 47900, 50963, 44489, 37336, 44944, 27914, 22530,
            34207, 33994, 44484, 44529, 38373, 47901, 44528, 53344, 62158, 53323, 70164, 54446,
            53344, 53343, 55016, 67839, 63770, 55002, 44879, 44871, 47898, 60692, 60616, 60668,
            54999, 38374, 34007, 60763, 55016, 53343, 53344, 44645, 44484, 53344, 50368, 50338,
            61120, 47898, 63765, 55642, 60692, 60767, 57691, 44592, 44488, 41602, 56039, 60623,
            60714, 62948, 59625, 44636, 44149, 55777, 60663, 57683, 59621, 60691, 44645, 47672,
            57690, 62256, 63770, 25072, 38373, 27984, 50370, 50336, 44508,
        ];
        return validIds.includes(id);
    }
}

export default GemUtils;
