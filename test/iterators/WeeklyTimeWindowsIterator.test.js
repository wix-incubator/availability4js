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

    it ('handles DST (start / forward)', () => {
        // Clock Changes in São Paulo, São Paulo, Brazil in 2017
        //   When local standard time is about to reach
        //   Sunday, October 15, 2017, 00:00:00 clocks are turned forward 1 hour to
        //   Sunday, October 15, 2017, 01:00:00 local daylight time instead.
        const today = moment.tz([2017, 10-1, 14, 0, 0, 0, 0], 'America/Sao_Paulo');
        const tomorrow = moment.tz([2017, 10-1, 15, 0, 0, 0, 0], 'America/Sao_Paulo');
        const alsoTomorrow = moment.tz([2017, 10-1, 15, 1, 0, 0, 0], 'America/Sao_Paulo');
        const dayAfterTomorrow = moment.tz([2017, 10-1, 16, 0, 0, 0, 0], 'America/Sao_Paulo');

        // Sanity: verify DST start
        expect(tomorrow.valueOf()).to.equal(alsoTomorrow.valueOf());

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
        const status1 = it.next();
        expect(status1.status).to.equal(Status.STATUS_AVAILABLE);
        expect(status1.until).to.equal(tomorrow.valueOf());

        expect(it.hasNext()).to.be.true;
        const status2 = it.next();
        expect(status2.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(status2.until).to.equal(dayAfterTomorrow.valueOf());
    });

    /* TODO: fix test, the dates are all messed up
    it ('handles DST (end / backward)', () => {
        // Clock Changes in São Paulo, São Paulo, Brazil in 2017
        //   When local daylight time was about to reach
        //   Sunday, February 19, 2017, 00:00:00 clocks were turned backward 1 hour to
        //   Saturday, February 18, 2017, 23:00:00 local standard time instead.
        const today = moment.tz([2017, 2-1, 18, 0, 0, 0, 0], 'America/Sao_Paulo');
        const tomorrow = moment.tz([2017, 2-1, 19, 0, 0, 0, 0], 'America/Sao_Paulo');
        const dayAfterTomorrow = moment.tz([2017, 2-1, 20, 0, 0, 0, 0], 'America/Sao_Paulo');

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
        const status1 = it.next();
        expect(status1.status).to.equal(Status.STATUS_AVAILABLE);
        expect(status1.until).to.equal(tomorrow.valueOf());

        expect(it.hasNext()).to.be.true;
        const status2 = it.next();
        expect(status2.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(status2.until).to.equal(dayAfterTomorrow.valueOf());
    });
    */

    it ('handles consecutive windows', () => {
        const cal = moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz);

        const tester = createTester({
            cal: cal,
            weekly: [
                Object.freeze({
                    minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                    durationMins: WeeklyTimeWindow.DAY
                }),
                Object.freeze({
                    minuteOfWeek: WeeklyTimeWindow.MONDAY,
                    durationMins: 6 * WeeklyTimeWindow.DAY
                })
            ]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });
});
