import {iter} from './iteratorFactory';

export default function getEarliestAvailableTime(obj, from) {
    const iterator = iter(obj)(from);

    if (!iterator.hasNext()) {
        return null;
    }

    const status = iterator.next();

    return status.status === 'available' ? from.unix() * 1000 : status.until;
}
