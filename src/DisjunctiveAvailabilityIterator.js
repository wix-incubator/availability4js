"use strict";

import {AvailabilityIterator} from "./AvailabilityIterator";
import {MergingStatusIterator} from "./MergingStatusIterator";
import {strictlyBefore} from "./DateTimeWindowsUtils";

export class UnmergedDisjunctiveTimeWindowsIterator {
	/**
	 * @param availabilities   List<availability.Availability>
	 * @param cal              Moment with tz
	 */
    constructor({iterators = [], cal}) {
        this._now = cal.valueOf();
        this._nextStatus = null;

        this._wrapped = [];
        iterators.forEach(it => {
            this._wrapped.push({
                it: it,
                nextStatus: it.next() // There's always at least one status
            });
        });

        this._advanceNextStatus();
    }

	/** @return Boolean */
    hasNext() {
        return (this._nextStatus !== null);
    }

	/** @return Status */
    next() {
        const nextStatus = this._nextStatus;
        this._advanceNextStatus();
        return nextStatus;
    }

    _advanceNextStatus() {
		// Last status?
        if ((this._nextStatus !== null) && (this._nextStatus.until === null)) {
            this._nextStatus = null;
            return;
        }

		// Advance
        let earliestUnavailableUntil = null;

        for (let i = 0, l = this._wrapped.length; i < l; ++i) {
            const wrapped = this._wrapped[i];

            while ((wrapped.nextStatus !== null) && strictlyBefore(wrapped.nextStatus.until, this._now)) {
                wrapped.nextStatus = (wrapped.it.hasNext() ? wrapped.it.next() : null);
            }

            if (wrapped.nextStatus !== null) {
                if (wrapped.nextStatus.status === "available") {
                    this._now = wrapped.nextStatus.until;
                    this._nextStatus = wrapped.nextStatus;
                    return;
                } else {
                    if (wrapped.nextStatus.until !== null) {
                        earliestUnavailableUntil = ((earliestUnavailableUntil !== null) ? Math.min(earliestUnavailableUntil, wrapped.nextStatus.until): wrapped.nextStatus.until);
                    }
                }
            }
        }

        this._now = earliestUnavailableUntil;
        this._nextStatus = {
            status: "unavailable",
            until: earliestUnavailableUntil
        };
    }
}

export class DisjunctiveTimeWindowsIterator {

    constructor({iterators = [], cal}) {
        this._it = new MergingStatusIterator({
            it: new UnmergedDisjunctiveTimeWindowsIterator({iterators, cal}),
            maxIterations: 1000
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

export class DisjunctiveAvailabilityIterator {
	/**
	 * @param availabilities   List<availability.Availability>
	 * @param cal              Moment with tz
	 */
    constructor({availabilities = [], cal}) {
        availabilities = availabilities || []; // null availabilities are treated as empty array

        const iterators = availabilities.map(availability => new AvailabilityIterator({availability, cal}));

        this._it = new DisjunctiveTimeWindowsIterator({iterators, cal});
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
