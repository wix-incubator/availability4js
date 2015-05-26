var should = require('chai').should();
var CalendarAdvancer = require('./CalendarAdvancer.js');

module.exports = function(params) {
	params = params || {};
	var it = params.it || null; // Iterator<Status>
	var cal = params.cal || null; // Moment with tz
	
	var self = {};
	
	var advancer = new CalendarAdvancer();
	
	/**
	 * @param cal   Moment with tz
	 */
	self.setCal = function(_cal) {
		cal = _cal;
	};
	
	/**
	 * @param status   Status
	 * @param field    "day"
	 * @param amount   Integer
	 */
	self.assertNextStatus = function(status, field, amount) {
		it.hasNext().should.be.true;
		var actualStatus = it.next();
		actualStatus.status.should.equal(status);
		actualStatus.until.should.not.equal(null);
		advancer.advance(cal, field, amount);
		actualStatus.until.should.equal(cal.valueOf());
	};
	
	/**
	  * @param status   String
	  */
	self.assertLastStatus = function(status) {
		it.hasNext().should.be.true;
		var actualStatus = it.next();
		actualStatus.status.should.equal(status);
		should.equal(actualStatus.until, null);
	};
	
	self.assertDone = function() {
		it.hasNext().should.be.false;
	};
	
	return self;
};
