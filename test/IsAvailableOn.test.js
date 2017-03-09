import {isAvailableOn, iteratorFactory} from '../src/index';
import moment from 'moment';
import {assert} from 'chai';
import momentToExceptionTime from './momentToExceptionTime';

describe('isAvailableOn', () => {
    let iterator;

    beforeEach(() => {
        const {iter} = iteratorFactory;

        iterator = iter({
            exceptions: [{
                available: false,
                start: momentToExceptionTime(moment('2016-04-03')),
                end: momentToExceptionTime(moment('2016-04-04'))
            }]
        });
    });

    it('available', () => {
        const result = isAvailableOn(iterator, moment('2016-4-6'));

        assert.isTrue(result);
    });

    it('unavailable', () => {
        const result = isAvailableOn(iterator, moment('2016-04-03 14:00:00'));

        assert.isFalse(result);
    });
});
