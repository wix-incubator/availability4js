import advanceCalendar from '../../src/utils/advanceCalendar';
import {expect} from 'chai';
import moment from 'moment-timezone';
import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';

describe('advanceCalendar', () => {
    it('advances calendar to requested minute of week (same week)', () => {
        // In Asia/Jerusalem,
        //   advancing 2017-08-27 (Sunday) 00:00 to Monday yields 2017-08-28 (Monday) 00:00
        const cal = moment.tz([2017, 8-1, 27, 0, 0, 0, 0], 'Asia/Jerusalem');
        expect(cal.valueOf()).to.equal(1503781200000);

        advanceCalendar(cal, WeeklyTimeWindow.MONDAY);
        expect(cal.valueOf()).to.equal(1503867600000);
    });

    it('advances calendar to requested minute of week (next week)', () => {
        // In Asia/Jerusalem,
        //   advancing 2017-08-26 (Saturday) 00:00 to Monday yields 2017-08-28 (Monday) 00:00
        const cal = moment.tz([2017, 8-1, 26, 0, 0, 0, 0], 'Asia/Jerusalem');
        expect(cal.valueOf()).to.equal(1503694800000);

        advanceCalendar(cal, WeeklyTimeWindow.MONDAY);
        expect(cal.valueOf()).to.equal(1503867600000);
    });

    it('supports sub-minute calendars', () => {
        // In Asia/Jerusalem,
        //   advancing 2017-08-26 (Saturday) 00:00:30 to Monday yields 2017-08-28 (Monday) 00:00
        const cal = moment.tz([2017, 8-1, 26, 0, 0, 30, 0], 'Asia/Jerusalem');
        expect(cal.valueOf()).to.equal(1503694830000);

        advanceCalendar(cal, WeeklyTimeWindow.MONDAY);
        expect(cal.valueOf()).to.equal(1503867600000);
    });

    it('stops advancing on DST start (clock jumps forward)', () => {
        // In Asia/Jerusalem,
        //   advancing 2016-03-25 (Friday) 00:00 to Saturday yields 2016-03-25 (Friday) 02:00
        //
        // Explanation:
        //   when local standard time was about to reach
        //   2016-03-25 (Friday) 02:00 clocks were turned forward 1 hour to
        //   2016-03-25 (Friday) 03:00 local daylight time instead.
        const cal = moment.tz([2016, 3-1, 25, 0, 0, 0, 0], 'Asia/Jerusalem');
        expect(cal.valueOf()).to.equal(1458856800000);

        advanceCalendar(cal, WeeklyTimeWindow.SATURDAY);
        expect(cal.valueOf()).to.equal(1458864000000);
    });

    it('stops advancing on DST end (clock jumps backward)', () => {
        // In Asia/Jerusalem,
        //   advancing 2016-10-30 (Sunday) 00:00 to Monday yields the second occurrence of 2016-10-30 (Sunday) 01:00
        //
        // Explanation:
        //   when local daylight time was about to reach
        //   2016-10-30 (Sunday) 02:00 clocks were turned backward 1 hour to
        //   2016-10-30 (Sunday) 01:00 local standard time instead.
        const cal = moment.tz([2016, 10-1, 30, 0, 0, 0, 0], 'Asia/Jerusalem');
        expect(cal.valueOf()).to.equal(1477774800000);

        advanceCalendar(cal, WeeklyTimeWindow.MONDAY);
        expect(cal.valueOf()).to.equal(1477782000000);
    });

    it('runs fast', () => {
        const cal = moment.tz([2016, 1-1, 1, 0, 0, 0, 0], 'Asia/Jerusalem'); // Sunday

        for (let i = 0; i < 10*52; ++i) { // advance 10 years
            advanceCalendar(cal, WeeklyTimeWindow.MONDAY);
            advanceCalendar(cal, WeeklyTimeWindow.SUNDAY);
        }
    });
});
