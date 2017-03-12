'use strict';

import {expect} from 'chai';
import {CalendarAdvancer} from './CalendarAdvancer';

export class StatusIteratorTester {
    constructor({it, cal}) {
        it = it || null; // Iterator<Status>
        cal = cal || null; // Moment with tz

        this._it = it;
        this._cal = cal;
        this._advancer = new CalendarAdvancer();
    }

	/**
	 * @param cal   Moment with tz
	 */
    setCal(cal) {
        this._cal = cal;
    }

	/**
	 * @param status   Status
	 * @param field    "day"
	 * @param amount   Integer
	 */
    assertNextStatus(status, field, amount) {
        expect(this._it.hasNext()).to.be.true;
        let actualStatus = this._it.next();
        expect(actualStatus.status).to.equal(status);
        expect(actualStatus.until).to.not.be.null;
        this._advancer.advance(this._cal, field, amount);
        expect(actualStatus.until).to.equal(this._cal.valueOf());
    }

	/**
	  * @param status   String
	  */
    assertLastStatus(status) {
        expect(this._it.hasNext()).to.be.true;
        let actualStatus = this._it.next();
        expect(actualStatus.status).to.equal(status);
        expect(actualStatus.until).to.be.null;
    }

    assertDone() {
        expect(this._it.hasNext()).to.be.false;
    }
}
