"use strict"

import * as Status from "./Status.js"
import moment from 'moment-timezone'

class Index {
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

export class DateTimeWindowsIterator {
	constructor({timeWindows, cal}) {
		timeWindows = timeWindows || [] // List<DateTimeWindow>
		cal = cal || null // Moment with tz
		
		this._timeWindows = timeWindows
		this._tz = cal.tz()
		
		this._index = null
		this._lastWindowUntilForever = null
		if (this._timeWindows.length > 0) {
			this._index = this._findInsertionIndex(this._timeWindows, cal.valueOf())
			this._lastWindowUntilForever = !timeWindows[this._timeWindows.length-1].end
		} else {
			this._index = new Index(0, true)
			this._lastWindowUntilForever = false
		}
		
	}
	
	/**
	 * @param date   availability.Date
	 * @return Long
	 */
	_getTime(date) {
		if (!date) {
            return null
		}
		return moment.tz([date.year, date.month - 1, date.day, date.hour, date.minute], this._tz).valueOf()
	}
	
    _strictlyBefore(window1EndTs, window2StartTs) {
        if ((window1EndTs === null) || (window2StartTs === null)) {
            return false
        }
        return (window1EndTs <= window2StartTs)
    }
	
	_compare(timestamp, timeWindow) {
		if (this._strictlyBefore(timestamp + 1000, this._getTime(timeWindow.start))) {
			return -1
		} else if (this._strictlyBefore(this._getTime(timeWindow.end), timestamp)) {
			return 1
		} else {
			return 0
		}
	}
	
	/**
	 * @param timeWindows   List<DateTimeWindow>
	 * @param timestamp     Long
	 * @return Index
	 */
	_findInsertionIndex(timeWindows, timestamp) {
		// TODO: use binary search
		for (let i = 0, l = timeWindows.length; i < l; ++i) {
			let timeWindow = timeWindows[i]
			
			let c = this._compare(timestamp, timeWindow)
			if (c < 0) {
				return new Index(i, true)
			} if (c === 0) {
				return new Index(i, false)
			}
		}
		return new Index(timeWindows.length, true)
	}
	
	/** @return Boolean */
	hasNext() {
		if (this._index.index < this._timeWindows.length) {
			return true
		}
		
		return (this._index.isDummyBefore && !this._lastWindowUntilForever)
	}
	
	/** @return Status */
	next() {
        let result
        
		if (this._index.index === this._timeWindows.length) {
			result = {
				status : Status.STATUS_UNKNOWN,
				until : null
			}
		} else {
			let nextTimeWindow = this._timeWindows[this._index.index]
			if (!this._index.isDummyBefore) {
				result = {
					status: (nextTimeWindow.available ? Status.STATUS_AVAILABLE : Status.STATUS_UNAVAILABLE),
					until: this._getTime(nextTimeWindow.end),
					reason: nextTimeWindow.reason,
					comment: nextTimeWindow.comment
				}
			} else {
				result = {
					status: Status.STATUS_UNKNOWN,
					until: this._getTime(nextTimeWindow.start)
				}
			}
		}
		
		this._index.advance()
		return result
	}
}
