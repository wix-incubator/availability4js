'use strict';

import moment from 'moment-timezone';
import _ from 'lodash';

export class Index {
	/**
	 * @param index           Integer
	 * @param isDummyBefore   Boolean
	 */
    constructor(index, isDummyBefore) {
        this.index = index;
        this.isDummyBefore = isDummyBefore;
    }

    advance() {
        if (this.isDummyBefore) {
            this.isDummyBefore = false;
        } else {
            this.isDummyBefore = true;
            ++this.index;
        }
    }
}

/**
 * @param timeWindows   List<DateTimeWindow>
 * @param timestamp     Long
 * @param tz            Timezone
 * @return Index
 */
export const findInsertionIndex = (timeWindows, timestamp, tz) => {
	// TODO: use binary search
    for (let i = 0, l = timeWindows.length; i < l; ++i) {
        let timeWindow = timeWindows[i];

        let c = compare(timestamp, timeWindow, tz);
        if (c < 0) {
            return new Index(i, true);
        } if (c === 0) {
            return new Index(i, false);
        }
    }
    return new Index(timeWindows.length, true);
};


/**
 * @param date   availability.Date
 * @return Long
 */
export const getTime = (date, tz) => {
    if (!date) {
        return null;
    }
    return moment.tz([date.year, date.month - 1, date.day, date.hour, date.minute], tz).valueOf();
};

export const strictlyBefore = (window1EndTs, window2StartTs) => {
    if ((window1EndTs === null) || (window2StartTs === null)) {
        return false;
    }
    return (window1EndTs <= window2StartTs);
};

const compare = (timestamp, timeWindow, tz) => {
    if (strictlyBefore(timestamp + 1000, getTime(timeWindow.start, tz))) {
        return -1;
    } else if (strictlyBefore(getTime(timeWindow.end, tz), timestamp)) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * Maps each availability.Date to a Long value, for easy comparison.
 *
 * @param date      availability.Date
 * @param isStart   Boolean; Does the date argument represent 'start' or 'end'
 * @return Long
 */
const dateToNum = (date, isStart) => {
    if (!date) {
        return (isStart ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY);
    } else {
        return date.year * 60 * 60 * 60 * 32 * 366 +
			date.month * 60 * 60 * 32 +
			date.day * 60 * 60 +
			date.hour * 60 +
			date.minute;
    }
};

export const normalize = (timeWindows) => {
    const separators = _.reduce(timeWindows, (acc, timeWindow) => {
        if (timeWindow.start) {
            acc.points.push(timeWindow.start);
        } else {
            acc.hasSinceForever = true;
        }
        if (timeWindow.end) {
            acc.points.push(timeWindow.end);
        } else {
            acc.hasUntilForever = true;
        }

        return acc;
    }, {
        hasSinceForever: false,
        hasUntilForever: false,
        points: []
    });

    const sortedUniquePoints =
		_(separators.points)
		.sortBy((point) => { return dateToNum(point, true); })
		.sortedUniqBy((point) => { return dateToNum(point, true); })
		.value();

	// Convert list to sorted non-overlapping windows
    const normalizedTimeWindows = [];
    if (separators.hasSinceForever) {
        if (sortedUniquePoints.length > 0) {
            normalizedTimeWindows.push({
                start: null,
                end: sortedUniquePoints[0]
            });
        } else if (separators.hasUntilForever) {
            normalizedTimeWindows.push({
                start: null,
                end: null
            });
        }
    }

    for (let i = 0; i < sortedUniquePoints.length - 1; ++i) {
        normalizedTimeWindows.push({
            start: sortedUniquePoints[i],
            end: sortedUniquePoints[i+1]
        });
    }

    if (separators.hasUntilForever) {
        if (sortedUniquePoints.length > 0) {
            normalizedTimeWindows.push({
                start: sortedUniquePoints[sortedUniquePoints.length - 1],
                end: null
            });
        }
    }

	// Assign availability to windows, omit unknowns
    return _(normalizedTimeWindows)
		.map((normalizedTimeWindow) => {
    const normalizedStart = dateToNum(normalizedTimeWindow.start, true);
    const normalizedEnd = dateToNum(normalizedTimeWindow.end, false);

    const timeWindow = _.findLast(timeWindows, (timeWindow) => {
        return (normalizedStart >= dateToNum(timeWindow.start, true)) &&
					(normalizedEnd <= dateToNum(timeWindow.end, false));
    });

    return (timeWindow ? _.defaults(normalizedTimeWindow, timeWindow) : null);
})
		.compact()
		.value();
};
