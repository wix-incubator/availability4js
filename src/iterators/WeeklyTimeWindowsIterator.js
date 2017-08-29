import {MergingStatusIterator} from './MergingStatusIterator';
import * as Status from './Status';
import * as WeeklyTimeWindow from './WeeklyTimeWindow';
import advanceCalendar from '../utils/advanceCalendar';

export class WeeklyTimeWindowsIterator {
	/**
	 * @param weekly   List<WeeklyTimeWindow>
	 * @param cal      Moment with tz
	 */
    constructor({weekly = [], cal}) {
        weekly = weekly || []; // null weekly is supported, equivalent to empty weekly

        this._it = new MergingStatusIterator({
            it: new WeeklyTimeWindowsIteratorImpl({
                weekly,
                cal
            })
        });
    }

	/** @return Boolean */
    hasNext() {
        return this._it.hasNext();
    }

	/** @return Status */
    next() {
        return this._it.next();
    }
}

/**
 * @param cal   Moment with tz
 * @return Integer
 */
const minutesFromStartOfWeek = cal => {
    return (cal.day() - WeeklyTimeWindow.SUNDAY) * WeeklyTimeWindow.DAY +
        cal.hour() * WeeklyTimeWindow.HOUR +
        cal.minute();
};

const normalize = weekly => {
    const normalized = [];

    let lastTimeWindow = null;
    for (let i = 0; i < weekly.length; ++i) {
        const timeWindow = JSON.parse(JSON.stringify(weekly[i]));
        if (lastTimeWindow) {
            if (lastTimeWindow.minuteOfWeek + lastTimeWindow.durationMins === timeWindow.minuteOfWeek) {
                lastTimeWindow.durationMins += timeWindow.durationMins;
            } else {
                normalized.push(lastTimeWindow);
                lastTimeWindow = timeWindow;
            }
        } else {
            lastTimeWindow = timeWindow;
        }
    }
    if (lastTimeWindow) {
        normalized.push(lastTimeWindow);
    }

    return normalized;
};

class WeeklyTimeWindowsIteratorImpl {
	/**
	 * @param weekly   List<WeeklyTimeWindow>
	 * @param cal      Moment with tz
	 */
    constructor({weekly = [], cal}) {
        weekly = normalize(weekly || []); // null weekly is supported, equivalent to empty weekly

        this._cal = cal.clone(); // "cal" is modified later, this allows the caller to reuse his version of it

        this._hasNext = true;
        this._timeWindows = [];
        this._isFirstAndLastSame = null;

        if (weekly.length === 0) {
            this._timeWindows.push({
                minuteOfWeek : 0,
                durationMins : WeeklyTimeWindow.WEEK,
                status : Status.STATUS_AVAILABLE
            });
            this._isFirstAndLastSame = true;
        } else {
            let minuteOfWeek = 0;
            for (let i = 0, l = weekly.length; i < l; ++i) {
                const timeWindow = weekly[i];
                if (timeWindow.minuteOfWeek > minuteOfWeek) {
                    this._timeWindows.push({
                        minuteOfWeek : minuteOfWeek,
                        durationMins : timeWindow.minuteOfWeek - minuteOfWeek,
                        status : Status.STATUS_UNAVAILABLE
                    });
                }
                this._timeWindows.push({
                    minuteOfWeek : timeWindow.minuteOfWeek,
                    durationMins : timeWindow.durationMins,
                    status : Status.STATUS_AVAILABLE
                });
                minuteOfWeek = this._endMinuteOfWeek(timeWindow);
            }
            if (minuteOfWeek < WeeklyTimeWindow.WEEK) {
                this._timeWindows.push({
                    minuteOfWeek : minuteOfWeek,
                    durationMins : WeeklyTimeWindow.WEEK - minuteOfWeek,
                    status : Status.STATUS_UNAVAILABLE
                });
            }

            const firstWindow = this._timeWindows[0];
            const lastWindow = this._timeWindows[this._timeWindows.length - 1];
            this._isFirstAndLastSame = (firstWindow.status === lastWindow.status);
        }

        this._isConstant = (this._timeWindows.length === 1);
    }

	/**
	 * @param timeWindow   WeeklyTimeWindow
	 * @return Integer
	 */
    _endMinuteOfWeek(timeWindow) {
        return timeWindow.minuteOfWeek + timeWindow.durationMins;
    }

	/** @return Boolean */
    hasNext() {
        return this._hasNext;
    }

	/** @return Status */
    next() {
        if (this._isConstant) {
            this._hasNext = false;
            return {
                status: this._timeWindows[0].status,
                until : null
            };
        }

        const minuteOfWeek = minutesFromStartOfWeek(this._cal);
        const currentWindow = this._timeWindows[this._find(minuteOfWeek)];
        let newMinuteOfWeek = this._endMinuteOfWeek(currentWindow);
        if (newMinuteOfWeek === WeeklyTimeWindow.WEEK) {
            newMinuteOfWeek = (this._isFirstAndLastSame ? this._endMinuteOfWeek(this._timeWindows[0]) : 0);
        }

        advanceCalendar(this._cal, newMinuteOfWeek);
        return {
            status : currentWindow.status,
            until: this._cal.valueOf()
        };
    }

	/**
	 * @param minuteOfWeek   Integer
	 * @return Integer index in _timeWindows member
	 */
    _find(minuteOfWeek) {
		// _timeWindows are assumed to be sorted, so we can use binary search
        let low = 0;
        let high = this._timeWindows.length;

        while (low < high) {
            const mid = (low + high) >>> 1;
            const midValue = this._endMinuteOfWeek(this._timeWindows[mid]);
            if (midValue <= minuteOfWeek) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }
}
