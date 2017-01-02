import {expect} from 'chai';
import {ConjunctiveTimeWindowsIterator, Status, AvailabilityIterator} from '../src/index';
import * as WeeklyTimeWindow from '../src/WeeklyTimeWindow';
import moment from 'moment-timezone';

const tz = 'Asia/Jerusalem';

describe('ConjunctiveTimeWindowsIterator', () => {

    it('conjuncts availabilities that include exceptions', () => {

        const availability1 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                durationMins: WeeklyTimeWindow.DAY
            }, {
                minuteOfWeek: WeeklyTimeWindow.MONDAY,
                durationMins: WeeklyTimeWindow.DAY
            }]
        };

        const availability2 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.MONDAY,
                durationMins: WeeklyTimeWindow.DAY
            }, {
                minuteOfWeek: WeeklyTimeWindow.TUESDAY,
                durationMins: WeeklyTimeWindow.DAY
            }]
        };

        // TODO: Add exceptions

        const cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz); // Sunday
        const timestamp = 1292104800000;

        const iterator = new ConjunctiveTimeWindowsIterator({
            iterators: [availability1, availability2].map(availability => new AvailabilityIterator({availability, cal})),
            cal: cal
        });

        expect(iterator.hasNext()).to.be.true;

        let val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(timestamp + 1000 * 60 * 60 * 24); // Monday
        expect(iterator.hasNext()).to.be.true;

        val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_AVAILABLE);
        expect(val.until).to.equal(timestamp + 2 * 1000 * 60 * 60 * 24); // Tuesday
        expect(iterator.hasNext()).to.be.true;

        val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(timestamp + 8 * 1000 * 60 * 60 * 24); // Monday
        expect(iterator.hasNext()).to.be.true;
    });

    it('works if given null availabilities (returns unavailable always)', () => {

        const cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz); // Sunday

        const iterator = new ConjunctiveTimeWindowsIterator({
            iterators: null,
            cal: cal
        });

        expect(iterator.hasNext()).to.be.true;

        let val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(null);
        expect(iterator.hasNext()).to.be.false;
    });

    it('works if given full week availabilities (returns available always)', () => {

        const availability1 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                durationMins: WeeklyTimeWindow.WEEK
            }]
        };

        const availability2 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                durationMins: WeeklyTimeWindow.WEEK
            }]
        };

        const cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz); // Sunday

        const iterator = new ConjunctiveTimeWindowsIterator({
            iterators: [availability1, availability2].map(availability => new AvailabilityIterator({availability, cal})),
            cal: cal
        });

        expect(iterator.hasNext()).to.be.true;

        let val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_AVAILABLE);
        expect(val.until).to.equal(null);
        expect(iterator.hasNext()).to.be.false;
    });

    it('works if given one availability representing a full week, and one availability representing one day', () => {

        const availability1 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                durationMins: WeeklyTimeWindow.WEEK
            }]
        };

        const availability2 = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.MONDAY,
                durationMins: WeeklyTimeWindow.DAY
            }]
        };

        const cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz); // Sunday
        const timestamp = 1292104800000;

        const iterator = new ConjunctiveTimeWindowsIterator({
            iterators: [availability1, availability2].map(availability => new AvailabilityIterator({availability, cal})),
            cal: cal
        });

        expect(iterator.hasNext()).to.be.true;

        let val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(timestamp + 1000 * 60 * 60 * 24); // Monday
        expect(iterator.hasNext()).to.be.true;

        val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_AVAILABLE);
        expect(val.until).to.equal(timestamp + 2 * 1000 * 60 * 60 * 24); // Tuesday
        expect(iterator.hasNext()).to.be.true;

        val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(timestamp + 8 * 1000 * 60 * 60 * 24); // Monday
        expect(iterator.hasNext()).to.be.true;
    });
});
