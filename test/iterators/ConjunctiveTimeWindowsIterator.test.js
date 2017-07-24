import {expect} from 'chai';
import {ConjunctiveTimeWindowsIterator, DisjunctiveTimeWindowsIterator, InverseTimeWindowsIterator, Status, AvailabilityIterator} from '../../src/index';
import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';
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

    it('Tests a specific situation', () => {
        let cal = moment();

        const availabilities = [{
            'weekly': [{
                'minuteOfWeek': 0,
                'durationMins': 1425
            }, {
                'minuteOfWeek': 1440,
                'durationMins': 8640
            }]
        }, {
            'weekly': [{
                'minuteOfWeek': 0,
                'durationMins': 1440
            }, {
                'minuteOfWeek': 8640,
                'durationMins': 1440
            }]
        }];

        const it = new DisjunctiveTimeWindowsIterator({
            iterators: availabilities.map(availability => new AvailabilityIterator({availability, cal:cal.clone()})),
            cal: cal.clone()
        });

        const it2 = new InverseTimeWindowsIterator({
            iterator: it
        });

        const it3 = new InverseTimeWindowsIterator({
            iterator: new AvailabilityIterator({availability:{}, cal:cal.clone()})
        });

        const it4 = new DisjunctiveTimeWindowsIterator({
            iterators: [it2, it3],
            cal: cal.clone()
        });

        //console.log(it4.next());

        /*
        var it = new ConjunctiveTimeWindowsIterator({
            iterators: [iterator, new AvailabilityIterator({ availability: {}, cal: cal.clone() })],
            cal: cal.clone()
        });
        */
    });

    it('Test another specific situation with an available event and a different timezone', () => {
        const availabilities = [{
            weekly: [{
                minuteOfWeek: 2430, // open: Mon, 16:30 for two hours
                durationMins: 120
            }, {
                minuteOfWeek: 6750, // open: Thursday, 16:30 for two hours
                durationMins: 120
            }],
            exceptions: [{ // But also open Tuesday, 30th May 2017, at 16:30 for two hours
                start: {
                    year: 2017,
                    month: 5,
                    day: 30,
                    hour: 16,
                    minute: 30
                },
                end: {
                    year: 2017,
                    month: 5,
                    day: 30,
                    hour: 18,
                    minute: 30
                },
                available: true,
            }]
        }, {
            weekly: [{
                minuteOfWeek: 0,
                durationMins: 10080
            }],
            exceptions: [{
                start: {
                    year: 2017,
                    month: 5,
                    day: 28,
                    hour: 23,
                    minute:59
                },
                end: {
                    year: 2017,
                    month: 5,
                    day: 29,
                    hour: 23,
                    minute: 59
                },
                available: false,
            }]
        }];

        {
            const cal = moment.tz([2017, 4, 30, 18, 0, 0, 0], tz);

            const it = new ConjunctiveTimeWindowsIterator({
                iterators: availabilities.map(availability => new AvailabilityIterator({availability, cal:cal})),
                cal: cal
            });

            const next = it.next();

            expect(next.status).to.equal('available');
        }
        {
            const cal = moment.tz([2017, 4, 30, 18, 0, 0, 0], 'America/New_York');

            const it = new ConjunctiveTimeWindowsIterator({
                iterators: availabilities.map(availability => new AvailabilityIterator({availability, cal:cal})),
                cal: cal
            });

            const next = it.next();

            expect(next.status).to.equal('available');
        }
    });
});
