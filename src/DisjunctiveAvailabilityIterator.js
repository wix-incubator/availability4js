"use strict"

import {AvailabilityIterator} from "./AvailabilityIterator"
import {MergingStatusIterator} from "./MergingStatusIterator"
import {strictlyBefore} from "./DateTimeWindowsUtils"

export class DisjunctiveTimeWindowsIterator {
	constructor({availabilities, cal}) {
		availabilities = availabilities || [] // List<availability.Availability>
		cal = cal || null // Moment with tz
		
		this._now = cal.valueOf()
		this._nextStatus = null

		this._wrapped = []
		availabilities.forEach(availability => {
			let it = new AvailabilityIterator({availability, cal})
			this._wrapped.push({
				it: it,
				nextStatus: it.next() // There's always at least one status
			})
		})
		
		this._advanceNextStatus()
	}
	
	/** @return Boolean */
	hasNext() {
		return (this._nextStatus !== null)
	}
	
	/** @return Status */
	next() {
		let nextStatus = this._nextStatus
		this._advanceNextStatus()
		return nextStatus
	}
	
	_advanceNextStatus() {
		// Last status?
		if ((this._nextStatus !== null) && (this._nextStatus.until === null)) {
			this._nextStatus = null
			return
		}
		
		// Advance
		let earliestUnavailableUntil = null
		
		for (let i = 0, l = this._wrapped.length; i < l; ++i) {
			let wrapped = this._wrapped[i]
			
			while ((wrapped.nextStatus !== null) && strictlyBefore(wrapped.nextStatus.until, this._now)) {
				wrapped.nextStatus = (wrapped.it.hasNext() ? wrapped.it.next() : null)
			}
			
			if (wrapped.nextStatus !== null) {
				if (wrapped.nextStatus.status === "available") {
					this._now = wrapped.nextStatus.until
					this._nextStatus = wrapped.nextStatus
					return
				} else {
					if (wrapped.nextStatus.until !== null) {
						earliestUnavailableUntil = ((earliestUnavailableUntil !== null) ? Math.min(earliestUnavailableUntil, wrapped.nextStatus.until): wrapped.nextStatus.until)
					}
				}
			}
		}
		
		this._now = earliestUnavailableUntil
		this._nextStatus = {
			status: "unavailable",
			until: earliestUnavailableUntil
		}
	}
}

export class DisjunctiveAvailabilityIterator {
	constructor({availabilities, cal}) {
		availabilities = availabilities || [] // List<availability.Availability>
		cal = cal || null // Moment with tz
		
		this._it = new MergingStatusIterator({
			it: new DisjunctiveTimeWindowsIterator({availabilities, cal}),
			maxIterations: 1000
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
