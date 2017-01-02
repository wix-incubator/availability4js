import {DisjunctiveTimeWindowsIterator} from './DisjunctiveAvailabilityIterator';
import {InverseTimeWindowsIterator} from './InverseTimeWindowsIterator';
import {AvailabilityIterator} from './AvailabilityIterator';

export function ConjunctiveTimeWindowsIterator({iterators = [], cal}) {

    iterators = iterators || []; // null isn't caught by default

    if (iterators.length > 0) {

        // A&B = ~(~A | ~B)
        return new InverseTimeWindowsIterator({
            iterator: new DisjunctiveTimeWindowsIterator({
                iterators: iterators.map(it => new InverseTimeWindowsIterator({iterator:it})),
                cal
            })
        });

    } else {
        // Special handler for no iterators (always closed)
        const alwaysClosedAvailability = {exceptions:[{availabile:false}]};

        return new AvailabilityIterator({
            availability:alwaysClosedAvailability,
            cal
        });
    }

}
