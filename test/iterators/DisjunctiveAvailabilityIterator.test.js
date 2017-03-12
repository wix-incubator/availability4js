'use strict';

import {DisjunctiveAvailabilityIterator, Status} from '../../src/index';
import {StatusIteratorTester} from './StatusIteratorTester';
import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';
import {CalendarAdvancer} from './CalendarAdvancer';
import moment from 'moment-timezone';

describe('DisjunctiveAvailabilityIterator/DisjunctiveTimeWindowsIterator', () => {
    const createTester = ({cal, availabilities}) => {
        return new StatusIteratorTester({
            it: new DisjunctiveAvailabilityIterator({
                availabilities: availabilities,
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

    it ('defaults to treating availabilities as empty array', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday
        });

        tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
        tester.assertDone();
    });

    it ('defaults to treating null availabilities as empty availabilities', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            availabilities: null,
            cal: yesterday
        });

        tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
        tester.assertDone();
    });

    it ('returns a single status for a full weekly schedule with a redundant exception', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday,
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.WEEK
                }],
                exceptions: [
                    when(cal, 'day', 1, true)
                ]
            }]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns 3 statuses for a full weekly schedule with a non-redundant exception with an end date', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday,
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.WEEK
                }],
                exceptions: [
                    when(cal, 'day', 1, false)
                ]
            }]
        });

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns a series of statuses for a complex weekly schedule with an exception', () => {
        let cal1 = moment.tz([2010, 12-1, 10, 0, 0, 0, 0], tz);
        let cal2 = moment.tz([2010, 12-1, 14, 12, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal1,
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                },
                {
                    minuteOfWeek: WeeklyTimeWindow.TUESDAY,
                    durationMins: 2 * WeeklyTimeWindow.DAY
                }],
                exceptions: [
                    when(cal2, 'hour', 12, false)
                ]

            }]
        });

        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 2);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'hour', 12);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'hour', 12);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 3);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 2);
    });

    it ('returns a single status for a full weekly schedule with an exception "until forever"', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let ex = when(cal, 'day', 1, false);
        ex.end = null;

        let tester = createTester({
            cal: cal,
            availabilities: [{
                weekly: null,
                exceptions: [ex]
            }]
        });

        tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
        tester.assertDone();
    });

    it ('returns a single status for a partial weekly schedule with an exception "until forever"', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let ex = when(cal, 'day', 1, false);
        ex.end = null;

        let tester = createTester({
            cal: cal,
            availabilities: [{
                weekly: [
                    {
                        minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                        durationMins: WeeklyTimeWindow.DAY
                    }
                ],
                exceptions: [ex]
            }]
        });

        tester.assertLastStatus(Status.STATUS_UNAVAILABLE);
        tester.assertDone();
    });

    it ('returns correct statuses for 6 partial weekly schedules with no exceptions', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday,
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.TUESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.WEDNESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.THURSDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.FRIDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            }]
        });

        for (let i = 0; i < 100; ++i) {
            tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 6);
            tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 1);
        }
    });

    it ('returns a single status for 7 complementing weekly schedules with no exceptions', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let yesterday = cal.clone();
        advancer.advance(yesterday, 'day', -1);

        let tester = createTester({
            cal: yesterday,
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.TUESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.WEDNESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.THURSDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.FRIDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SATURDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            }]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it.skip('returns a single status for 7 complementing weekly schedules with exceptions', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        const execptionStart = cal.clone();
        advancer.advance(execptionStart, 'day', 1001);

        const exception = when(execptionStart, 'day', 1, false);
        exception.end = null;

        let tester = createTester({
            cal: cal.clone(),
            availabilities: [{
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }],
                exceptions: [
                    exception
                ]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.TUESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.WEDNESDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.THURSDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.FRIDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            },
            {
                weekly: [{
                    minuteOfWeek: WeeklyTimeWindow.SATURDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }]
            }]
        });

        // This is the right behaviour...
        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1000);

        // ... but this is the current behaviour because of the MergingStatusIterator limitation of 1000
        // iterations, and placing .until = null if reaching that limitation
        // tester.assertLastStatus(Status.STATUS_AVAILABLE);
    });
});
