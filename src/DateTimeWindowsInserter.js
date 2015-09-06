"use strict"

import moment from 'moment-timezone'

export class Index {
	/**
	 * @param index           Integer
	 * @param isDummyBefore   Boolean
	 */
	constructor(index, isDummyBefore) {
		this.index = index
		this.isDummyBefore = isDummyBefore
	}
	
	advance() {
		if (this.isDummyBefore) {
			this.isDummyBefore = false
		} else {
			this.isDummyBefore = true
			++this.index
		}
	}
}

export class DateTimeWindowsInserter {
	/**
	 * @param timeWindows   List<DateTimeWindow>
	 * @param timestamp     Long
	 * @param tz            Timezone
	 * @return Index
	 */
	findInsertionIndex(timeWindows, timestamp, tz) {
		// TODO: use binary search
		for (let i = 0, l = timeWindows.length; i < l; ++i) {
			let timeWindow = timeWindows[i]
			
			let c = this._compare(timestamp, timeWindow, tz)
			if (c < 0) {
				return new Index(i, true)
			} if (c === 0) {
				return new Index(i, false)
			}
		}
		return new Index(timeWindows.length, true)
	}

	/**
	 * @param date   availability.Date
	 * @return Long
	 */
	_getTime(date, tz) {
		if (!date) {
            return null
		}
		return moment.tz([date.year, date.month - 1, date.day, date.hour, date.minute], tz).valueOf()
	}
	
    _strictlyBefore(window1EndTs, window2StartTs) {
        if ((window1EndTs === null) || (window2StartTs === null)) {
            return false
        }
        return (window1EndTs <= window2StartTs)
    }
	
	_compare(timestamp, timeWindow, tz) {
		if (this._strictlyBefore(timestamp + 1000, this._getTime(timeWindow.start, tz))) {
			return -1
		} else if (this._strictlyBefore(this._getTime(timeWindow.end, tz), timestamp)) {
			return 1
		} else {
			return 0
		}
	}
}
