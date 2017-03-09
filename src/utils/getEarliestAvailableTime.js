import { DisjunctiveAvailabilityIterator } from '../iterators/DisjunctiveAvailabilityIterator';
import { AvailabilityIterator } from '../iterators/AvailabilityIterator';
import { ConjunctiveTimeWindowsIterator } from '../iterators/ConjunctiveTimeWindowsIterator';

export default function getEarliestAvailableTime(iterator, from) {
    if (!iterator.hasNext()) {
        return {
            available: false,
            until: null
        };
    }

    const status = iterator.next();

    return status.status === "available" ? from.unix() * 1000 : status.until;
}
