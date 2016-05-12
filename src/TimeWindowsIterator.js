"use strict"

import {WeeklyTimeWindowsIterator} from "./WeeklyTimeWindowsIterator.js"
import {DateTimeWindowsIterator} from "./DateTimeWindowsIterator.js"
import * as Status from "./Status.js"

export class TimeWindowsIterator {
	constructor({availability, cal}) {
		availability = availability || {} // availability.Availability
		cal = cal || null // Moment with tz
		
		this._regularIt = new WeeklyTimeWindowsIterator({
			cal: cal,
			weekly: availability.weekly
		})
		this._exceptionsIt = new DateTimeWindowsIterator({
			cal: cal,
			timeWindows: availability.exceptions
		})
		
		// TimeWindow iterators always return at least one element
		this._regularStatus = this._regularIt.next()
		this._exceptionStatus = this._exceptionsIt.next()
		this._hasNext = true
	}
	
	/** @return Boolean */
	hasNext() {
		return this._hasNext
	}
	
	/** @return Status */
	next() {
		// Future has no exceptions?
		if (this._exceptionStatus.status === Status.STATUS_UNKNOWN && !this._exceptionStatus.until) {
			// Continue with regular statuses
			let lastRegularStatus = this._regularStatus
			if (this._regularIt.hasNext()) {
				this._regularStatus = this._regularIt.next()
			} else {
				this._hasNext = false
			}
			return lastRegularStatus
		}
		
		// So we do have real exceptions to deal with
		
		// Real exceptions take precedent
		if (Status.STATUS_UNKNOWN !== this._exceptionStatus.status) {
			// If the exception is indefinite, it trumps everything else
			if (!this._exceptionStatus.until) {
				this._hasNext = false
				return this._exceptionStatus
			}
		
			let lastExceptionStatus = this._exceptionStatus
			this._exceptionStatus = this._exceptionsIt.next() // we know there are still real exceptions later
			
			while ((this._regularStatus.until) && (this._regularStatus.until <= lastExceptionStatus.until)) {
				this._regularStatus = this._regularIt.next()
			}
			
			return lastExceptionStatus
		}
		
		// No real exception this time
		if ((!this._regularStatus.until) || (this._regularStatus.until > this._exceptionStatus.until)) {
			let lastExceptionStatus = this._exceptionStatus
			this._exceptionStatus = this._exceptionsIt.next() // we know there are still real exceptions later
			return {
				status: this._regularStatus.status,
				until: lastExceptionStatus.until
			}
		} else if (this._regularStatus.until < this._exceptionStatus.until) {
			let lastRegularStatus = this._regularStatus
			this._regularStatus = this._regularIt.next() // we know there are still regular statuses later
			return lastRegularStatus
		} else {
			this._exceptionStatus = this._exceptionsIt.next() // we know there are still real exceptions later
			let lastRegularStatus = this._regularStatus
			this._regularStatus = this._regularIt.next() // we know there are still regular statuses later
			return lastRegularStatus
		}
	}
}
