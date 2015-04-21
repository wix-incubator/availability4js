var should = require('chai').should();
var MergingStatusIterator = require("../src/MergingStatusIterator.js");
var StatusIteratorTester = require("./StatusIteratorTester.js");
var StatusListIterator = require("./StatusListIterator.js");
var Status = require("../src/Status.js");
var timezoneJS = require('timezone-js');

describe("MergingStatusIterator", function() {
	function createTester(params) {
		params = params || {};
		var cal = params.cal || null; // timezoneJS.Date
		var statuses = params.statuses || []; // List<Status>

		return new StatusIteratorTester({
			it: new MergingStatusIterator({
				it: new StatusListIterator({
					statuses: statuses
				})
			}),
			cal: cal
		});
	}
	
    it ('returns a single status when given a single status', function() {
		var tester = createTester({
			statuses: [
				{
					status: Status.STATUS_AVAILABLE,
					until: null
				}			
			]
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns two statuses when given two different statuses', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			statuses: [
				{
					status: Status.STATUS_UNAVAILABLE,
					until: cal.getTime()
				},
				{
					status: Status.STATUS_AVAILABLE,
					until: null
				}
			]
		});
		
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 0);
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns a single status when given two same statuses', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			statuses: [
				{
					status: Status.STATUS_AVAILABLE,
					until: cal.getTime()
				},
				{
					status: Status.STATUS_AVAILABLE,
					until: null
				}
			]
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });	
});
