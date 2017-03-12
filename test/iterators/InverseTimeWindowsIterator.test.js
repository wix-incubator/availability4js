import {expect} from 'chai';
import {InverseTimeWindowsIterator, AvailabilityIterator, Status} from '../../src/index';
import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';
import moment from 'moment-timezone';

const tz = 'Asia/Jerusalem';

describe('InverseTimeWindowsIterator', () => {

    it('Inverses a given iterator', () => {

        const availability = {
            weekly:[{
                minuteOfWeek: WeeklyTimeWindow.SUNDAY,
                durationMins: WeeklyTimeWindow.DAY
            }, {
                minuteOfWeek: WeeklyTimeWindow.MONDAY,
                durationMins: WeeklyTimeWindow.DAY
            }]
        };

        const cal = moment.tz([2010, 12-1, 12, 0, 0, 0, 0], tz); // Sunday
        const timestamp = 1292104800000;

        const iterator = new InverseTimeWindowsIterator({
            iterator: new AvailabilityIterator({availability, cal})
        });

        expect(iterator.hasNext()).to.be.true;

        let val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_UNAVAILABLE);
        expect(val.until).to.equal(timestamp + 2 * 1000 * 60 * 60 * 24); // Tuesday
        expect(iterator.hasNext()).to.be.true;

        val = iterator.next();
        expect(val.status).to.equal(Status.STATUS_AVAILABLE);
        expect(val.until).to.equal(timestamp + 7 * 1000 * 60 * 60 * 24); // Sunday
        expect(iterator.hasNext()).to.be.true;
    });

});
