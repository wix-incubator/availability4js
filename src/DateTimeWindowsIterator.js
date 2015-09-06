"use strict"

import * as Status from "./Status.js"
import moment from 'moment-timezone'
import {Index, findInsertionIndex, getTime} from "./DateTimeWindowsUtils.js"


export class DateTimeWindowsIterator {
	constructor({timeWindows, cal}) {
		timeWindows = timeWindows || [] // List<DateTimeWindow>
		cal = cal || null // Moment with tz
		
		this._timeWindows = timeWindows
		this._tz = cal.tz()
		
		this._index = null
		this._lastWindowUntilForever = null
		if (this._timeWindows.length > 0) {
			this._index = findInsertionIndex(this._timeWindows, cal.valueOf(), this._tz)
			this._lastWindowUntilForever = !timeWindows[this._timeWindows.length-1].end
		} else {
			this._index = new Index(0, true)
			this._lastWindowUntilForever = false
		}
		
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
					until: getTime(nextTimeWindow.end, this._tz),
					reason: nextTimeWindow.reason,
					comment: nextTimeWindow.comment
				}
			} else {
				result = {
					status: Status.STATUS_UNKNOWN,
					until: getTime(nextTimeWindow.start, this._tz)
				}
			}
		}
		
		this._index.advance()
		return result
	}
}
