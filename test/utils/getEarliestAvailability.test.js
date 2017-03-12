import {iter} from '../../src/utils/iteratorFactory';
import {getEarliestAvailableTime} from '../../src/index';
import momentToExceptionTime from './momentToExceptionTime';
import moment from 'moment-timezone';
import {assert} from 'chai';

describe('getEarliestAvailableTime', () => {
    beforeEach(() => {
        moment.tz.setDefault('Asia/Jerusalem');
    });

    it('available on from', () => {
        //Given
        const from = moment('2016-04-03');

        const start = momentToExceptionTime(from.add(-1, 'm'));
        const end = momentToExceptionTime(from.add(1, 'm'));

        const it = iter({
            exceptions: [{
                available: true,
                start,
                end
            }]
        });

        //When
        const result = getEarliestAvailableTime(it, from);

        //Then
        assert.equal(result, from.unix() * 1000);
    });

    it('available later', () => {
        //Given
        const from = moment('2016-04-03');

        const start = momentToExceptionTime(from.clone().add(3, 'd'));
        const end = momentToExceptionTime(from.clone().add(4, 'd'));

        const iterator = iter({
            weekly: [{
                minuteOfWeek: 10070,
                durationMins: 5
            }],
            exceptions: [{
                available: true,
                start,
                end
            }]
        });

        //When
        const result = getEarliestAvailableTime(iterator, from);

        //Then
        assert.equal(result, from.clone().add(3, 'd').unix() * 1000);
    });

    it('never available', () => {

    });
});
