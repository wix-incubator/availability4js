var should = require('chai').should();
var DateTimeWindowsIterator = require("../src/DateTimeWindowsIterator.js");
var StatusIteratorTester = require("./StatusIteratorTester.js");
var CalendarAdvancer = require("./CalendarAdvancer.js");
var Status = require("../src/Status.js");
var timezoneJS = require('timezone-js');

describe("DateTimeWindowsIterator", function() {
	function createTester(params) {
		params = params || {};
		var cal = params.cal || null; // timezoneJS.Date
		var timeWindows = params.timeWindows || null; // List<DateTimeWindow>

		return new StatusIteratorTester({
			it: new DateTimeWindowsIterator({
				timeWindows: timeWindows,
				cal: cal
			}),
			cal: cal
		});
	}
	
	function toDate(cal) {
		return {
			year: cal.getFullYear(),
			month: cal.getMonth() + 1,
			day: cal.getDate(),
			hour: cal.getHours(),
			minute: cal.getMinutes()
		};
	}
	
	var advancer = new CalendarAdvancer();
	function when(startCal, field, amount, available) {
		var endCal = startCal.clone();
		advancer.advance(endCal, field, amount);
		return {
			start: toDate(startCal),
			end: toDate(endCal),
			available: available
		};
	}
	
    it ('returns a single unknown status when given null timeWindows', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			timeWindows: null
		});
		
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
	
    it ('returns a single unknown status when given no time windows', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			timeWindows: []
		});
		
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
	
    it ('returns two statuses when given a single "since forever" window and pointed in it', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 12, 0, 0, 0, 0);
		
		var window = when(cal, "day", 1, true);
		window.start = null;
		
		var tester = createTester({
			cal: cal,
			timeWindows: [ window ]
		});
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
	
    it ('returns a single status when given a single "until forever" window and pointed to it', function() {
		console.log("----------------------");
		var cal = new timezoneJS.Date(2010, 12-1, 12, 0, 0, 0, 0);
		
		var window = when(cal, "day", 1, true);
		window.end = null;
		
		var tester = createTester({
			cal: cal,
			timeWindows: [ window ]
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns a single status when given a single "since forever, until forever" window and pointed to it', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 12, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			timeWindows: [{
				start: null,
				end: null,
				available: true
			}]
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns two statuses when given a single time window and pointed to its start', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 12, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			timeWindows: [
				when(cal, "day", 1, true)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
	
    it ('returns three statuses when given a single time window and pointed to before its start', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var yesterday = cal.clone();
		advancer.advance(yesterday, "day", -1);
		
		var tester = createTester({
			cal: yesterday,
			timeWindows: [
				when(cal, "day", 1, false)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_UNKNOWN, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1);
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
	
    it ('returns the correct status when pointed to middle of window', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var midWindow = cal.clone();
		advancer.advance(midWindow, "hour", 12);
		
		var tester = createTester({
			cal: midWindow,
			timeWindows: [
				when(cal, "day", 1, true)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "hour", 12);
    });
	
    it ('returns 5 statuses when given 3 separate windows, and pointed to between 1st and 2nd', function() {
		var cal1 = new timezoneJS.Date(2010, 12-1, 11, 0, 0, 0, 0);
		var cal2 = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		var cal3 = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tomorrow = cal1.clone();
		advancer.advance(tomorrow, "day", 1);
		
		var tester = createTester({
			cal: tomorrow,
			timeWindows: [
				when(cal1, "day", 1, true),
				when(cal2, "day", 1, false),
				when(cal3, "day", 1, true)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_UNKNOWN, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNKNOWN, "day", 1);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertLastStatus(Status.STATUS_UNKNOWN);
		tester.assertDone();
    });
});
