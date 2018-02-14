import proxyquire from 'proxyquire';
import {assert, expect} from 'chai';
import moment from 'moment-timezone';

describe('iteratorFactory', () => {
    const index = proxyquire('../../src/index', {
        '../index': {
            AvailabilityIterator: ({availability, cal}) => ({ type: 'AvailabilityIterator', availability, cal}),
            DisjunctiveTimeWindowsIterator: ({iterators, cal}) => ({type: 'DisjunctiveIterator', iterators, cal}),
            ConjunctiveTimeWindowsIterator: ({iterators, cal}) => ({type: 'ConjunctiveIterator', iterators, cal}),
            '@global': true
        }
    });

    const tz = 'Asia/Jerusalem';
    const factory = index.iteratorFactory;
    const {iter, conjunct, disjunct} = factory;

    it('disjunct(iter, conjunct(iter))', () => {
        //Given
        const av = {weekly: [{}]};
        const getIter = disjunct([iter(av), conjunct([iter(av)])]);

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'DisjunctiveIterator',
            iterators: [{
                type: 'AvailabilityIterator',
                availability: av,
                cal
            }, {
                type: 'ConjunctiveIterator',
                iterators: [{
                    availability: av,
                    type: 'AvailabilityIterator',
                    cal
                }],
                cal
            }],
            cal
        });
    });

    it('disjunct(iter, conjunct(iter)) - listing the iterators as args', () => {
        //Given
        const av = {weekly: [{}]};
        const getIter = disjunct(iter(av), conjunct(iter(av)));

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'DisjunctiveIterator',
            iterators: [{
                type: 'AvailabilityIterator',
                availability: av,
                cal
            }, {
                type: 'ConjunctiveIterator',
                iterators: [{
                    availability: av,
                    type: 'AvailabilityIterator',
                    cal
                }],
                cal
            }],
            cal
        });
    });

    it('disjunct and conjunct with null weekly', () => {
        //Given
        const av = {weekly: null};
        const getIter = disjunct(iter(av), conjunct(iter(av)));

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'DisjunctiveIterator',
            iterators: [{
                type: 'AvailabilityIterator',
                availability: av,
                cal
            }, {
                type: 'ConjunctiveIterator',
                iterators: [{
                    availability: av,
                    type: 'AvailabilityIterator',
                    cal
                }],
                cal
            }],
            cal
        });
    });

    it('can disjunct availability objects directly', () => {
        //Given
        const availability1 = {weekly: [{minuteOfWeek:0, durationMins:10}]};
        const availability2 = {weekly: [{minuteOfWeek:10, durationMins:10}]};
        const getIter = disjunct(availability1, availability2);

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'DisjunctiveIterator',
            cal,
            iterators: [{
                type: 'AvailabilityIterator',
                cal,
                availability: availability1
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability: availability2
            }]
        });
    });

    it('can conjunct availability objects directly', () => {
        //Given
        const availability1 = {weekly: [{minuteOfWeek:0, durationMins:10}]};
        const availability2 = {weekly: [{minuteOfWeek:10, durationMins:10}]};
        const getIter = conjunct(availability1, availability2);

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'ConjunctiveIterator',
            cal,
            iterators: [{
                type: 'AvailabilityIterator',
                cal,
                availability: availability1
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability: availability2
            }]
        });
    });

    it('joins same availability objects', () => {
        //Given
        const availability1 = {weekly: [{minuteOfWeek:0, durationMins:10}]};
        const availability2 = {weekly: [{minuteOfWeek:0, durationMins:10}]};
        const getIter = disjunct(availability1, availability2);

        const cal = '2016-04-3';

        //When
        const composedIter = getIter(cal);

        //Then
        assert.deepEqual(composedIter, {
            type: 'DisjunctiveIterator',
            cal,
            iterators: [{
                type: 'AvailabilityIterator',
                cal,
                availability: availability1
            }]
        });
    });

    it('conjunct with null', () => {
        //Given
        const availability = {weekly: [{minuteOfWeek: 5, durationMins: 10}]};
        const cal = '2016-04-03';
        const result = conjunct(null, availability)(cal);

        assert.deepEqual(result, {
            type: 'ConjunctiveIterator',
            cal,
            iterators: [{
                type: 'AvailabilityIterator',
                cal,
                availability: null
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability
            }]
        });
    });

    it('disjunct with null', () => {
        //Given
        const availability = {weekly: [{minuteOfWeek: 5, durationMins: 10}]};
        const cal = '2016-04-03';
        const result = disjunct(null, availability)(cal);

        assert.deepEqual(result, {
            type: 'DisjunctiveIterator',
            cal,
            iterators: [{
                type: 'AvailabilityIterator',
                cal,
                availability: null
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability
            }]
        });
    });

    it('conjunct with daylight saving', () => {
        //Given
        const { iteratorFactory } = require('../../src/index');
        const { conjunct, disjunct } = iteratorFactory;
        const availability = {weekly: [{minuteOfWeek: 5 * 60, durationMins: 60}]};
        const cal = moment.tz('2017-03-19', tz);
        const tester = disjunct(availability, conjunct(availability, availability))(cal);

        let next = tester.next();
        expect(moment.tz(next.until, tz).format('H')).to.equal('5');
        next = tester.next();
        expect(moment.tz(next.until, tz).format('H')).to.equal('6');
        next = tester.next();
        expect(moment.tz(next.until, tz).format('H')).to.equal('5');
        next = tester.next();
        expect(moment.tz(next.until, tz).format('H')).to.equal('6');
    });
});
