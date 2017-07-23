import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';
import _ from 'lodash';
import {humanizeWeekly} from '../../src/index';
import {expect} from 'chai';

describe('humanizeWeekly', () => {
    it('handles 24/7 schedule', () => {
        const weekly = [{
            minuteOfWeek: WeeklyTimeWindow.SUNDAY,
            durationMins: WeeklyTimeWindow.WEEK
        }];

        expect(humanizeWeekly(weekly)).to.deep.equal([{
            days: [0, 1, 2, 3, 4, 5, 6],
            window: {
                minuteOfDay: 0,
                durationMins: WeeklyTimeWindow.DAY
            }
        }]);
    });

    it('handles simple daily schedule', () => {
        // The "Dolly Parton" schedule: Mon-Fri, 9AM-5PM
        const weekly = _.map([1, 2, 3, 4, 5], day => {
            return {
                minuteOfWeek: day * WeeklyTimeWindow.DAY + 9 * WeeklyTimeWindow.HOUR,
                durationMins: (17 - 9) * WeeklyTimeWindow.HOUR
            };
        });

        expect(humanizeWeekly(weekly)).to.deep.equal([{
            days: [1, 2, 3, 4, 5],
            window: {
                minuteOfDay: 9 * WeeklyTimeWindow.HOUR,
                durationMins: (17 - 9) * WeeklyTimeWindow.HOUR
            }
        }]);
    });

    it('handles daily schedule with multiple windows', () => {
        // The "Dolly Parton with a break" schedule: Mon-Fri, 9AM-12PM, 1PM-5PM
        const weekly = _.flatMap([1, 2, 3, 4, 5], day => {
            return [{
                minuteOfWeek: day * WeeklyTimeWindow.DAY + 9 * WeeklyTimeWindow.HOUR,
                durationMins: (12 - 9) * WeeklyTimeWindow.HOUR
            },
            {
                minuteOfWeek: day * WeeklyTimeWindow.DAY + 13 * WeeklyTimeWindow.HOUR,
                durationMins: (17 - 13) * WeeklyTimeWindow.HOUR
            }];
        });

        expect(humanizeWeekly(weekly)).to.deep.equal([{
            days: [1, 2, 3, 4, 5],
            window: {
                minuteOfDay: 9 * WeeklyTimeWindow.HOUR,
                durationMins: (12 - 9) * WeeklyTimeWindow.HOUR
            }
        },
        {
            days: [1, 2, 3, 4, 5],
            window: {
                minuteOfDay: 13 * WeeklyTimeWindow.HOUR,
                durationMins: (17 - 13) * WeeklyTimeWindow.HOUR
            }
        }]);
    });

    it('handles windows that overlap to next week', () => {
        // Sat, 5PM-3AM
        const weekly = [{
            minuteOfWeek: WeeklyTimeWindow.SATURDAY + 17 * WeeklyTimeWindow.HOUR,
            durationMins: (27 - 17) * WeeklyTimeWindow.HOUR
        }];

        expect(humanizeWeekly(weekly)).to.deep.equal([{
            days: [6],
            window: {
                minuteOfDay: 17 * WeeklyTimeWindow.HOUR,
                durationMins: (27 - 17) * WeeklyTimeWindow.HOUR
            }
        }]);
    });
});
