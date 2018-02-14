import {AvailabilityIterator, DisjunctiveTimeWindowsIterator, ConjunctiveTimeWindowsIterator} from '../index';
import isAvailabilityObject from './isAvailabilityObject';
import _ from 'lodash';

export function iter(availability) {
    if (!isAvailabilityObject(availability))
        return availability;

    return cal => {
        return new AvailabilityIterator({
            availability,
            cal
        });
    };
}

export function disjunct() {
    let objects = normalizeArgs(arguments);

    return cal => {
        const iterators = toIterators(objects, cal);

        return new DisjunctiveTimeWindowsIterator({
            iterators,
            cal
        });
    };
}

export function conjunct() {
    let objects = normalizeArgs(arguments);

    return cal => {
        const iterators = toIterators(objects, cal);

        return new ConjunctiveTimeWindowsIterator({
            iterators,
            cal
        });
    };
}

function toIterators(objects, cal) {

    const objectsByType = _.groupBy(objects, obj => {
        if (typeof obj === 'function') return 'function';
        if (isAvailabilityObject(obj)) return 'availability';
        throw new Error('cannot compose unknown object');
    });

    return _.union(
        _(objectsByType['function']).map(f => f(cal)).value(),
        _(objectsByType['availability']).uniqWith(_.isEqual).map(a => iter(a)(cal)).value()
    );
}

function normalizeArgs(a) {
    let objects = Array.prototype.slice.call(a);

    if (objects.length === 1 && objects[0] instanceof Array)
        objects = objects[0];

    return objects;
}
