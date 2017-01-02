"use strict";

import chai from 'chai';
import {CalendarAdvancer} from './CalendarAdvancer';

let should = chai.should();

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
        this._it.hasNext().should.be.true;
        let actualStatus = this._it.next();
        actualStatus.status.should.equal(status);
        actualStatus.until.should.not.equal(null);
        this._advancer.advance(this._cal, field, amount);
        actualStatus.until.should.equal(this._cal.valueOf());
    }

	/**
	  * @param status   String
	  */
    assertLastStatus(status) {
        this._it.hasNext().should.be.true;
        let actualStatus = this._it.next();
        actualStatus.status.should.equal(status);
        should.equal(actualStatus.until, null);
    }

    assertDone() {
        this._it.hasNext().should.be.false;
    }
}
