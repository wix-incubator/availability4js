import proxyquire from 'proxyquire';
import {assert} from 'chai';

describe('iteratorFactory', () => {
    const index = proxyquire('../src/index', {
        '../index': {
            AvailabilityIterator: ({availability, cal}) => ({ type: 'AvailabilityIterator', availability, cal}),
            DisjunctiveTimeWindowsIterator: ({iterators, cal}) => ({type: 'DisjunctiveIterator', iterators, cal}),
            ConjunctiveTimeWindowsIterator: ({iterators, cal}) => ({type: 'ConjunctiveIterator', iterators, cal}),
            '@global': true
        }
    });

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

    it('can disjunct availability objects directly', () => {
        //Given
        const availability = {weekly: [{}]};
        const getIter = disjunct(availability, availability);

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
                availability
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability
            }]
        });
    });

    it('can conjunct availability objects directly', () => {
        //Given
        const availability = {weekly: [{}]};
        const getIter = conjunct(availability, availability);

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
                availability
            }, {
                type: 'AvailabilityIterator',
                cal,
                availability
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
});
