"use strict"

import chai from 'chai'
import {AvailabilityIterator} from "../src/AvailabilityIterator.js"
import {StatusIteratorTester} from "./StatusIteratorTester.js"
import * as WeeklyTimeWindow from "../src/WeeklyTimeWindow.js"
import {CalendarAdvancer} from "./CalendarAdvancer.js"
import * as Status from "../src/Status.js"
import moment from 'moment-timezone'

describe("AvailabilityIterator", function() {
	function createTester({cal, weekly, exceptions}) {
		cal = cal || null // Moment with tz
		weekly = weekly || null // List<WeeklyTimeWindow>
		exceptions = exceptions || null // List<DateTimeWindow>

		return new StatusIteratorTester({
			it: new AvailabilityIterator({
				availability: {
					weekly: weekly,
					exceptions: exceptions
				},
				cal: cal
			}),
			cal: cal
		})
	}
	
	function toDate(cal) {
		return {
			year: cal.year(),
			month: cal.month() + 1,
			day: cal.date(),
			hour: cal.hour(),
			minute: cal.minute()
		}
	}
	
	let advancer = new CalendarAdvancer()
	function when(startCal, field, amount, available) {
		let endCal = startCal.clone()
		advancer.advance(endCal, field, amount)
		return {
			start: toDate(startCal),
			end: toDate(endCal),
			available: available
		}
	}

	let tz = "Asia/Jerusalem"
	
    it ('returns a single status for a full weekly schedule with a redundant exception', function() {
		let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz)
		
		let yesterday = cal.clone()
		advancer.advance(yesterday, "day", -1)
		
		let tester = createTester({
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
		})
		
		tester.assertLastStatus(Status.STATUS_AVAILABLE)
		tester.assertDone()
    })
	
    it ('returns 3 statuses for a full weekly schedule with a non-redundant exception with an end date', function() {
		let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz)
		
		let yesterday = cal.clone()
		advancer.advance(yesterday, "day", -1)
		
		let tester = createTester({
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
		})
		
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1)
		tester.assertLastStatus(Status.STATUS_AVAILABLE)
		tester.assertDone()
    })
	
    it ('returns a series of statuses for a complex weekly schedule with an exception', function() {
		let cal1 = moment.tz([2010, 12-1, 10, 0, 0, 0, 0], tz)
		let cal2 = moment.tz([2010, 12-1, 14, 12, 0, 0, 0], tz)
		
		let tester = createTester({
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
		})
		
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 2)
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "hour", 12)
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "hour", 12)
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 3)
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_UNAVAILABLE, "day", 1)
		tester.assertNextStatus(Status.STATUS_AVAILABLE, "day", 2)
    })

    it ('returns a single status for a full weekly schedule with an exception "until forever"', function() {
		let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz)
		
		let ex = when(cal, "day", 1, false)
		ex.end = null
		
		let tester = createTester({
			cal: cal,
			weekly: null,
			exceptions: [ex]
		})
		
		tester.assertLastStatus(Status.STATUS_UNAVAILABLE)
		tester.assertDone()
    })

    it ('returns a single status for a partial weekly schedule with an exception "until forever"', function() {
		let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz)

		let ex = when(cal, "day", 1, false)
		ex.end = null

		let tester = createTester({
			cal: cal,
			weekly: [
				{
					minuteOfWeek: WeeklyTimeWindow.SUNDAY,
					durationMins: WeeklyTimeWindow.DAY
				}
			],
			exceptions: [ex]
		})
		
		tester.assertLastStatus(Status.STATUS_UNAVAILABLE)
		tester.assertDone()
    })
})
