import {isDateAvailable} from '../src/index';
import moment from 'moment-timezone';
import {assert} from 'chai';

describe('isDateAvailable', () => {
    const monday = moment('2016-04-04').tz('Asia/Jerusalem');

    it('available by weekly', () => {
        //Given
        const availableOnMonday = {
            weekly: [{
                minuteOfWeek: 1540,
                durationMins: 1440
            }]
        };

        //When
        const result = isDateAvailable(monday, availableOnMonday);

        //Then
        assert.isTrue(result);
    });

    it('unavailable by weekly', () => {
        //Given
        const availableOnMonday = {
            weekly: [{
                minuteOfWeek: 2881,
                durationMins: 1440
            }]
        };

        //When
        const result = isDateAvailable(monday, availableOnMonday);

        //Then
        assert.isFalse(result);
    });

    it('available by exception', () => {
        //Given
        const availableOnMonday = {
            weekly: [{minuteOfWeek: 0, durationMins: 1}],
            exceptions: [{
                start: occasionTimeToExceptionTime(moment('2016-04-04')),
                end: occasionTimeToExceptionTime(moment('2016-04-04 23:59:59')),
                available: true
            }]
        };

        //When
        const result = isDateAvailable(monday, availableOnMonday);

        //Then
        assert.isTrue(result);
    });

    it('unavailable by exception', () => {
        //Given
        const unavailableOnMonday = {
            exceptions: [{
                start: occasionTimeToExceptionTime(monday),
                end: occasionTimeToExceptionTime(moment('2016-04-05')),
                available: false
            }]
        };

        //When
        const result = isDateAvailable(monday.clone().add(6, 'm'), unavailableOnMonday);

        //Then
        assert.isFalse(result);
    });

    function occasionTimeToExceptionTime(time) {
        return {
            year   : time.year(),
            month  : time.month() + 1,
            day    : time.date(),
            hour   : time.hour(),
            minute : time.minute()
        };
    }
});
