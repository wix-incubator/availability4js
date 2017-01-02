import * as Status from './Status';

export class InverseTimeWindowsIterator {
    constructor({iterator}) {
        this._it = iterator;
    }

	hasNext() {
		return this._it.hasNext()
	}
	
	next() {
        const next = this._it.next();

        if (next.status === Status.STATUS_UNAVAILABLE) {
            next.status = Status.STATUS_AVAILABLE;
        } else {
            next.status = Status.STATUS_UNAVAILABLE;
        }
        return next;
	}
}
