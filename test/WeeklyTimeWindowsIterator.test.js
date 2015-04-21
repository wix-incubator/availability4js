var should = require('chai').should();
var WeeklyTimeWindowsIterator = require("../src/WeeklyTimeWindowsIterator.js");
var WeeklyTimeWindow = require("../src/WeeklyTimeWindow.js");
var StatusIteratorTester = require("./StatusIteratorTester.js");
var Status = require("../src/Status.js");
var timezoneJS = require('timezone-js');

describe("DateTimeWindowsIterator", function() {
	function createTester(params) {
		params = params || {};
		var cal = params.cal || null; // timezoneJS.Date
		var weekly = params.weekly || null; // List<DateTimeWindow>

		return new StatusIteratorTester({
			it: new WeeklyTimeWindowsIterator({
				weekly: weekly,
				cal: cal
			}),
			cal: cal
		});
	}
	
    it ('returns a single available status when given null weekly', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: null
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns a single available status when given empty weekly', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 15, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: []
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns an infinite series of statuses for a Sunday-only schedule', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 12, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			]
		});
		
		for (var i = 0, l = 100; i < l; ++i) {
			tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
			tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 6);
		}
    });
	
    it ('returns an infinite series of statuses for a Monday-only schedule', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.MONDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			]
		});
		
		for (var i = 0, l = 100; i < l; ++i) {
			tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
			tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 6);
		}
    });
	
    it ('returns the correct status when pointed to middle of window', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 12, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.MONDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			]
		});
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "hour", 12);
    });
	
    it ('returns an infinite series of statuses for a Monday-Tuesday-Friday schedule', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.MONDAY,
					durationMins: 2 * WeeklyTimeWindow.DAY
				},
				{
					minuteOfWeek: WeeklyTimeWindow.FRIDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			]
		});
		
		for (var i = 0, l = 100; i < l; ++i) {
			tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 2);
			tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 2);
			tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
			tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 2);
		}
    });
});
