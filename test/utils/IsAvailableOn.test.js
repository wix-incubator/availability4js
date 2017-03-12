import {isAvailableOn, iteratorFactory} from '../../src/index';
import moment from 'moment';
import {assert} from 'chai';
import momentToExceptionTime from './momentToExceptionTime';

describe('isAvailableOn', () => {
    let iterator, availability;

    beforeEach(() => {
        const {iter} = iteratorFactory;

        availability = {
            exceptions: [{
                available: false,
                start: momentToExceptionTime(moment('2016-04-03')),
                end: momentToExceptionTime(moment('2016-04-04'))
            }]
        };

        iterator = iter(availability);
    });

    it('available', () => {
        const result = isAvailableOn(iterator, moment('2016-04-06'));

        assert.isTrue(result);
    });

    it('unavailable', () => {
        const result = isAvailableOn(iterator, moment('2016-04-03 14:00:00'));

        assert.isFalse(result);
    });

    it('can pass an availability object', () => {
        const result = isAvailableOn(availability, moment('2016-04-03 14:00:00'));

        assert.isFalse(result);
    });
});
