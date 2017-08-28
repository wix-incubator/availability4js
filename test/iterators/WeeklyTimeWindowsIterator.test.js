'use strict';

import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';
import {expect} from 'chai';
import {WeeklyTimeWindowsIterator} from '../../src/iterators/WeeklyTimeWindowsIterator';
import {StatusIteratorTester} from './StatusIteratorTester';
import {Status} from '../../src/index';
import moment from 'moment-timezone';

describe('WeeklyTimeWindowsIterator', () => {
    const createTester = ({cal, weekly}) => {
        cal = cal || null; // Moment with tz
        weekly = weekly || null; // List<DateTimeWindow>

        return new StatusIteratorTester({
            it: new WeeklyTimeWindowsIterator({
                weekly: weekly,
                cal: cal
            }),
            cal: cal
        });
    };

    let tz = 'Asia/Jerusalem';

    it ('returns a single available status when given null weekly', () => {
        let cal = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: null
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns a single available status when given empty weekly', () => {
        let cal = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: []
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns an infinite series of statuses for a Sunday-only schedule', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: [
                {
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }
            ]
        });

        for (let i = 0, l = 100; i < l; ++i) {
            tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
            tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 6);
        }
    });

    it ('returns the correct status when starting mid-minute in a Sunday-only schedule', () => {
        let cal = moment.tz([2010, 12-1, 12, 0, 0, 30, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: [
                {
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }
            ]
        });

        let calNoSeconds = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz);
        tester.setCal(calNoSeconds);

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
    });

    it ('returns an infinite series of statuses for a Monday-only schedule', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: [
                {
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }
            ]
        });

        for (let i = 0, l = 100; i < l; ++i) {
            tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
            tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 6);
        }
    });

    it ('returns the correct status when pointed to middle of window', () => {
        let cal = moment.tz([2010, 12-1, 13, 12, 0, 0, 0], tz);

        let tester = createTester({
            cal: cal,
            weekly: [
                {
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }
            ]
        });

        tester.assertNextStatus(Status.STATUS_AVAILABLE, 'hour', 12);
    });

    it ('returns an infinite series of statuses for a Monday-Tuesday-Friday schedule', () => {
        let cal = moment.tz([2010, 12-1, 13, 0, 0, 0, 0], tz);

        let tester = createTester({
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

        for (let i = 0, l = 100; i < l; ++i) {
            tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 2);
            tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 2);
            tester.assertNextStatus(Status.STATUS_AVAILABLE, 'day', 1);
            tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 2);
        }
    });

    it ('handles DST (forward)', () => {
        const today = moment.tz([2017, 10-1, 14, 0, 0, 0, 0], 'America/Sao_Paulo');
        const tomorrow = moment.tz([2017, 10-1, 15, 0, 0, 0, 0], 'America/Sao_Paulo');

        const it = new WeeklyTimeWindowsIterator({
            weekly: [
                {
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: 6 * WeeklyTimeWindow.DAY
                }
            ],
            cal: today
        });

        expect(it.hasNext()).to.be.true;
        const status = it.next();
        expect(status.status).to.equal(Status.STATUS_AVAILABLE);
        expect(status.until).to.equal(tomorrow.valueOf());
    });
});
