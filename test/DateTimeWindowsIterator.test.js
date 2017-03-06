'use strict';

import {DateTimeWindowsIterator} from '../src/iterators/DateTimeWindowsIterator';
import {StatusIteratorTester} from './StatusIteratorTester';
import {CalendarAdvancer} from './CalendarAdvancer';
import {Status} from '../src/index';
import moment from 'moment-timezone';

describe('DateTimeWindowsIterator', () => {
    const createTester = ({cal, timeWindows}) => {
        cal = cal || null; // Moment with tz
        timeWindows = timeWindows || null; // List<DateTimeWindow>

        return new StatusIteratorTester({
            it: new DateTimeWindowsIterator({
                timeWindows: timeWindows,
                cal: cal
            }),
            cal: cal
        });
    };

    const toDate = (cal) => {
        return {
            year: cal.year(),
            month: cal.month() + 1,
            day: cal.date(),
            hour: cal.hour(),
            minute: cal.minute()
        };
    };

    let advancer = new CalendarAdvancer();
    const when = (startCal, field, amount, available) => {
        let endCal = startCal.clone();
        advancer.advance(endCal, field, amount);
        return {
            start: toDate(startCal),
            end: toDate(endCal),
            available: available
        };
    };

    let tz = 'Asia/Jerusalem';

    it ('returns a single unknown status when given null timeWindows', () => {
        let cal = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            timeWindows: null
        });

        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('returns a single unknown status when given no time windows', () => {
        let cal = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            timeWindows: []
        });

        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('returns two statuses when given a single "since forever" window and pointed in it', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let window = when(cal, 'day', 1, true);
        window.start = null;

        let tester = createTester({
            cal: cal,
            timeWindows: [ window ]
        });

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('returns a single status when given a single "until forever" window and pointed to it', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let window = when(cal, 'day', 1, true);
        window.end = null;

        let tester = createTester({
            cal: cal,
            timeWindows: [ window ]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns a single status when given a single "since forever, until forever" (as null) window and pointed to it', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let tester = createTester({
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

    it ('returns a single status when given a single "since forever, until forever" (as undefined) window and pointed to it', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            timeWindows: [{
                available: true
            }]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns two statuses when given a single time window and pointed to its start', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            timeWindows: [
                when(cal, 'day', 1, true)
            ]
        });

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('returns three statuses when given a single time window and pointed to before its start', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday,
            timeWindows: [
                when(cal, 'day', 1, false)
            ]
        });

        tester.assertNextStatus(Status.STATUS_UNKNOWN, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('returns the correct status when pointed to middle of window', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let midWindow = cal.clone();
        advancer.advance(midWindow, 'hour', 12);

        let tester = createTester({
            cal: midWindow,
            timeWindows: [
                when(cal, 'day', 1, true)
            ]
        });

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'hour', 12);
    });

    it ('returns 5 statuses when given 3 separate windows, and pointed to between 1st and 2nd', () => {
        let cal1 = moment.tz([2010, 12-1, 11, 0, 0, 0, 0], tz);
        let cal2 = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);
        let cal3 = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        let tomorrow = cal1.clone();
        advancer.advance(tomorrow, 'day', 1);

        let tester = createTester({
            cal: tomorrow,
            timeWindows: [
                when(cal1, 'day', 1, true),
                when(cal2, 'day', 1, false),
                when(cal3, 'day', 1, true)
            ]
        });

        tester.assertNextStatus(Status.STATUS_UNKNOWN, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNKNOWN, 'day', 1);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });

    it ('supports overlapping windows by following the "last one wins" rule', () => {
        const yesterday = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);
        const today = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);
        const tomorrow = moment.tz([2010, 12-1, 14, 0, 0, 0, 0], tz);

        const tester = createTester({
            cal: yesterday,
            timeWindows: [
                when(today, 'day', 2, false),
                when(tomorrow, 'day', 1, true)
            ]
        });

        tester.assertNextStatus(Status.STATUS_UNKNOWN, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNKNOWN, 'day', 0); // TODO: This shouldn't be returned (we chose not to deal with it now as it doesn't really matter)
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_UNKNOWN);
        tester.assertDone();
    });
});
