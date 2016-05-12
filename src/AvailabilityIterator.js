"use strict"

import {MergingStatusIterator} from "./MergingStatusIterator"
import {TimeWindowsIterator} from "./TimeWindowsIterator"

export class AvailabilityIterator {
	/**
	 * @param availability   availability.Availability
	 * @param cal            Moment with tz
	 */
	constructor({availability = {}, cal}) {
		availability = availability || {} // null availability is treated as empty availability
		
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
