var should = require('chai').should();
var AvailabilityIterator = require("../src/AvailabilityIterator.js");
var StatusIteratorTester = require("./StatusIteratorTester.js");
var WeeklyTimeWindow = require("../src/WeeklyTimeWindow.js");
var CalendarAdvancer = require("./CalendarAdvancer.js");
var Status = require("../src/Status.js");
var timezoneJS = require('timezone-js');

describe("AvailabilityIterator", function() {
	function createTester(params) {
		params = params || {};
		var cal = params.cal || null; // timezoneJS.Date
		var weekly = params.weekly || null; // List<WeeklyTimeWindow>
		var exceptions = params.exceptions || null; // List<DateTimeWindow>

		return new StatusIteratorTester({
			it: new AvailabilityIterator({
				availability: {
					weekly: weekly,
					exceptions: exceptions
				},
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
	
    it ('returns a single status for a full weekly schedule with a redundant exception', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var yesterday = cal.clone();
		advancer.advance(yesterday, "day", -1);
		
		var tester = createTester({
			cal: yesterday,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.WEEK
				}
			],
			exceptions: [
				when(cal, "day", 1, true)
			]
		});
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns 3 statuses for a full weekly schedule with a non-redundant exception', function() {
		var cal = new timezoneJS.Date(2010, 12-1, 13, 0, 0, 0, 0);
		
		var yesterday = cal.clone();
		advancer.advance(yesterday, "day", -1);
		
		var tester = createTester({
			cal: yesterday,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.WEEK
				}
			],
			exceptions: [
				when(cal, "day", 1, false)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1);
		tester.assertLastStatus(Status.STATUS_AVAILABLE);
		tester.assertDone();
    });
	
    it ('returns a series of statuses for a complex weekly schedule with an exception', function() {
		var cal1 = new timezoneJS.Date(2010, 12-1, 10, 0, 0, 0, 0);
		var cal2 = new timezoneJS.Date(2010, 12-1, 14, 12, 0, 0, 0);
		
		var tester = createTester({
			cal: cal1,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.DAY
				},
				{
					minuteOfWeek: WeeklyTimeWindow.TUESDAY,
					durationMins: 2 * WeeklyTimeWindow.DAY
				}
			],
			exceptions: [
				when(cal2, "hour", 12, false)
			]
		});
		
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 2);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "hour", 12);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "hour", 12);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 3);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1);
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 2);
    });
});
