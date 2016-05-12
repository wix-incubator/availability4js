"use strict"

import {MergingStatusIterator} from "./MergingStatusIterator"
import {TimeWindowsIterator} from "./TimeWindowsIterator"

export class AvailabilityIterator {
	constructor({availability, cal}) {
		availability = availability || null // availability.Availability
		cal = cal || null // Moment with tz
		
		this._it = new MergingStatusIterator({
			it: new TimeWindowsIterator({
				availability: availability,
				cal: cal
			})
		})
	}
	
	/** @return Boolean */
	hasNext() {
		return this._it.hasNext()
	}
	
	/** @return Status */
	next() {
		return this._it.next()
	}
}
