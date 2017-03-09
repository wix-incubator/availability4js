import {AvailabilityIterator, DisjunctiveTimeWindowsIterator, ConjunctiveTimeWindowsIterator} from '../index';
import isAvailabilityObject from './isAvailabilityObject';

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
    return objects.map(obj => {
        if (typeof obj === 'function')
            return obj(cal);

        if (isAvailabilityObject(obj))
            return iter(obj)(cal);

        throw 'cannot compose unknown object';
    });
}

function normalizeArgs(a) {
    let objects = Array.prototype.slice.call(a);

    if (objects.length === 1 && objects[0] instanceof Array)
        objects = objects[0];

    return objects;
}
