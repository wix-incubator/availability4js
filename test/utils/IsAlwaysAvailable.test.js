import {isAlwaysAvailable, AvailabilityIterator} from '../../src/index';
import moment from 'moment';
import {assert} from 'chai';
import momentToExceptionTime from './momentToExceptionTime';

describe('isAlwaysAvailable', () => {
    it('always available', () => {
        const iter = new AvailabilityIterator({
            availability: {},
            cal: moment()
        });

        const result = isAlwaysAvailable(iter);

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

        const result = isAlwaysAvailable(iter);

        assert.isFalse(result);
    });
});
