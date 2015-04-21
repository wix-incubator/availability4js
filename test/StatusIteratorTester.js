var should = require('chai').should();

module.exports = function(params) {
	params = params || {};
	var it = params.it || null; // Iterator<Status>
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	function advance(cal, field, amount) {
		switch (field) {
			case  "day":
				cal.setDate(cal.getDate() + amount);
				break;
			default:
				throw new Error("Unsupported field: " + field);
		}
	}
	
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
		advance(cal, field, amount);
		actualStatus.until.should.equal(cal.getTime());
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
