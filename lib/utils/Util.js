"use strict";

module.exports = {
    sum: (array, key) => {
        key = key || (i => i);
        return array.reduce(
            (a, b) => a + key(b), 0
        );
    },
    sleep: async (milliseconds) => {
        await new Promise(r => setTimeout(r, milliseconds));
    },
    maybePromise: async (func, ...args) => {
        let result = func(...args);
        if (result instanceof Promise)
            result = await result;
        return result;
    },
    parseEmoji: emoji => {
        const re = /<(?<animated>a?):(?<name>[a-zA-Z0-9_]{2,32}):(?<id>[0-9]{17,})>/;
        let groups = re.exec(emoji)?.groups;
        if (groups) {
            groups.animated = !!groups.animated;
            return groups;
        }
        return { name: emoji };
    },
    parseSnowflake: (snowflake) => {
        const epoch = 1420070400000;
        let binary = '';
        try {
            snowflake = snowflake.toString()
            let high = parseInt(snowflake.slice(0, -10));
            let low = parseInt(snowflake.slice(-10));

            while (high > 0 || low > 0) {
                binary = String(low & 1) + binary;
                low = Math.floor(low / 2);
                if (high > 0) {
                    low += 5000000000 * (high % 2);
                    high = Math.floor(high / 2);
                }
            }

            binary = binary.toString(2).padStart(64, '0');
            const unix = parseInt(binary.substring(0, 42), 2) + epoch;
            return new Date(unix);
        } catch {
            return false;
        }
    },
    range: function* (start, stop, step = 1) {
        if (stop == undefined) {
            stop = start;
            start = 0;
        }
        let number = start;
        while (number < stop) {
            yield number;
            number += step;
        }
    },
}