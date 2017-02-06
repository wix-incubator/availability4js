import {isDateAvailable} from '../src/index';
import moment from 'moment';
import {assert} from 'chai';

describe('isDateAvailable', () => {
    it('available all day long by weekly', () => {
        //Given
        const availability = {
            weekly: {
                minuteOfWeek: 1440,
                durationMins: 1440
            }
        };

        //When
        const result = isDateAvailable(moment().tz('Asia/Jerusalem').startOf('w').add(1, 'd'));

        //Then
        assert.isTrue(result);
    });
});
