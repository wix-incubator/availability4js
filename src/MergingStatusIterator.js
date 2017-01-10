'use strict';

export class MergingStatusIterator {
    /**
     * @param it              Iterator<Status>
     * @param maxIterations   Int
     */
    constructor({it = null, maxIterations = null}) {
        this._it = it;
        this._maxIterations = maxIterations;
        this._nextStatus = ((this._it !== null) && (this._it.hasNext())) ? this._it.next() : null;
    }

    hasNext() {
        return (this._nextStatus != null);
    }

    /** @return Status */
    next() {
        const mergedStatus = this._nextStatus;

        let iteration = 0;
        while (true) {
            if (!this._it.hasNext()) {
                this._nextStatus = null;
                break;
            }
            this._nextStatus = this._it.next();
            if (!this._statusEqualsIgnoreUntil(this._nextStatus, mergedStatus)) {
                break;
            }
            mergedStatus.until = this._nextStatus.until;

            if ((this._maxIterations !== null) && (iteration++ >= this._maxIterations)) {

                // TODO: Patch. Without this a DisjunctiveTimeWindowsIterator using a DisjunctiveTimeWindowsIterator, both
                // using a MergingStatusIterator with a maxIterations of 1000, take a ***** very ***** long time to run (since
                // the external MergingStatusIterator will run 1000 of the internal's 1000.
                //
                // Solution: DisjunctiveTimeWindowsIterator v2.
                mergedStatus.until = null;
                this._nextStatus = null;
                break;
            }
        }
        return mergedStatus;
    }

    _stringMapEquals(map1, map2) {
        if (!map1) {
            return (map2 ? false : true);
        } else if (!map2) {
            return false;
        }

        for (let key in map1) {
            if (map1[key] !== map2[key]) {
                return false;
            }
        }
        for (let key in map2) {
            if (map2[key] !== map1[key]) {
                return false;
            }
        }
        return true;
    }

    _statusEqualsIgnoreUntil(status1, status2) {
        return ((status1.status === status2.status) &&
                (status1.reason === status2.reason) &&
                (this._stringMapEquals(status1.comment, status2.comment)));
    }
}
