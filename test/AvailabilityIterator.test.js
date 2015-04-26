var should = require('chai').should();
var AvailabilityIterator = require("../src/AvailabilityIterator.js");
var StatusIteratorTester = require("./StatusIteratorTester.js");
var WeeklyTimeWindow = require("../src/WeeklyTimeWindow.js");
var CalendarAdvancer = require("./CalendarAdvancer.js");
var Status = require("../src/Status.js");
var moment = require('moment-timezone');

describe("AvailabilityIterator", function() {
	function createTester(params) {
		params = params || {};
		var cal = params.cal || null; // Moment with tz
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
			year: cal.year(),
			month: cal.month() + 1,
			day: cal.date(),
			hour: cal.hour(),
			minute: cal.minute()
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

	var tz = "Asia/Jerusalem";
	
    it ('returns a single status for a full weekly schedule with a redundant exception', function() {
		var cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);
		
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
	
    it ('returns 3 statuses for a full weekly schedule with a non-redundant exception with an end date', function() {
		var cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);
		
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
		var cal1 = moment.tz([2010, 12-1, 10, 0, 0, 0, 0], tz);
		var cal2 = moment.tz([2010, 12-1, 14, 12, 0, 0, 0], tz);
		
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

    it ('returns a single status for a full weekly schedule with an exception "until forever"', function() {
		var cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);
		
		var ex = when(cal, "day", 1, false);
		ex.end = null;
		
		var tester = createTester({
			cal: cal,
			weekly: null,
			exceptions: [ex]
		});
		
		tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
		tester.assertDone();
    });

    it ('returns a single status for a partial weekly schedule with an exception "until forever"', function() {
		var cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

		var ex = when(cal, "day", 1, false);
		ex.end = null;

		var tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			],
			exceptions: [ex]
		});
		
		tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
		tester.assertDone();
    });

});
