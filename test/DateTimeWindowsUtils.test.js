'use strict';

import {expect} from 'chai';
import {normalize} from '../src/DateTimeWindowsUtils';
import {CalendarAdvancer} from './CalendarAdvancer';
import moment from 'moment-timezone';

describe ('DateTimeWindowsUtils', () => {
    describe('normalize', () => {
        const toDate = (cal) => {
            return {
                year: cal.year(),
                month: cal.month() + 1,
                day: cal.date(),
                hour: cal.hour(),
                minute: cal.minute()
            };
        };

        let advancer = new CalendarAdvancer();
        const when = (startCal, field, amount, available) => {
            let endCal = startCal.clone();
            advancer.advance(endCal, field, amount);
            return {
                start: toDate(startCal),
                end: toDate(endCal),
                available: available
            };
        };

        let tz = 'Asia/Jerusalem';

        it ('leaves an empty list as-is', () => {
            const normalized = normalize([]);

            expect(normalized.length).to.be.empty;
        });

        it ('leaves a singleton list as-is', () => {
            const normalized = normalize([
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, true)
            ]);

            expect(normalized).to.deep.equal([
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, true)
            ]);
        });

        it ('orders time windows first to last', () => {
            const normalized = normalize([
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, true),
                when(moment.tz([2010, 12-1, 14, 0, 0, 0, 0], tz), 'day', 1, true)
            ]);

            expect(normalized).to.deep.equal([
                when(moment.tz([2010, 12-1, 14, 0, 0, 0, 0], tz), 'day', 1, true),
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, true)
            ]);
        });

        it ('resolves overlapping windows by following the "last one wins" rule', () => {
            const normalized = normalize([
                when(moment.tz([2010, 12-1, 14, 0, 0, 0, 0], tz), 'day', 2, true),
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, false)
            ]);

            expect(normalized).to.deep.equal([
                when(moment.tz([2010, 12-1, 14, 0, 0, 0, 0], tz), 'day', 1, true),
                when(moment.tz([2010, 12-1, 15, 0, 0, 0, 0], tz), 'day', 1, false)
            ]);
        });
    });
});
