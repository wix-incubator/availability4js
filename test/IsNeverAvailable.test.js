import {isNeverAvailable, AvailabilityIterator} from '../src/index';
import moment from 'moment';
import {assert} from 'chai';
import momentToExceptionTime from './momentToExceptionTime';

describe('isNeverAvailable', () => {
    it('never available', () => {
        const iter = new AvailabilityIterator({
            availability: {
                exceptions: [{
                    available: false
                }]
            },
            cal: moment()
        });

        const result = isNeverAvailable(iter);

        assert.isTrue(result);
    });

    it('sometimes available', () => {
        const iter = new AvailabilityIterator({
            availability: {
                exceptions: [{
                    available: false,
                    start: momentToExceptionTime(moment()),
                    end: momentToExceptionTime(moment().add(1, 'd'))
                }]
            },
            cal: moment()
        });

        const result = isNeverAvailable(iter);

        assert.isFalse(result);
    });
});
