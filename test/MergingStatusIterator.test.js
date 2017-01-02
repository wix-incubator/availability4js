'use strict';

import {MergingStatusIterator} from '../src/MergingStatusIterator';
import {StatusIteratorTester} from './StatusIteratorTester';
import {StatusListIterator} from './StatusListIterator';
import * as Status from '../src/Status';
import moment from 'moment-timezone';

describe('MergingStatusIterator', () => {
    const createTester = ({cal, statuses}) => {
        cal = cal || null; // Moment with tz
        statuses = statuses || []; // List<Status>

        return new StatusIteratorTester({
            it: new MergingStatusIterator({
                it: new StatusListIterator({
                    statuses: statuses
                })
            }),
            cal: cal
        });
    };

    it ('returns a single status when given a single status', () => {
        let tester = createTester({
            statuses: [
                {
                    status: Status.STATUS_AVAILABLE,
                    until: null
                }
            ]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns two statuses when given two different statuses', () => {
        let cal = moment([2010, 12-1, 15, 0, 0, 0, 0]);

        let tester = createTester({
            cal: cal,
            statuses: [
                {
                    status: Status.STATUS_UNAVAILABLE,
                    until: cal.valueOf()
                },
                {
                    status: Status.STATUS_AVAILABLE,
                    until: null
                }
            ]
        });

        tester.assertNextStatus(Status.STATUS_UNAVAILABLE, 'day', 0);
        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });

    it ('returns a single status when given two same statuses', () => {
        let cal = moment([2010, 12-1, 15, 0, 0, 0, 0]);

        let tester = createTester({
            cal: cal,
            statuses: [
                {
                    status: Status.STATUS_AVAILABLE,
                    until: cal.valueOf()
                },
                {
                    status: Status.STATUS_AVAILABLE,
                    until: null
                }
            ]
        });

        tester.assertLastStatus(Status.STATUS_AVAILABLE);
        tester.assertDone();
    });
});
