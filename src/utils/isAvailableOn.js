import {iter} from './iteratorFactory';

export default function isAvailableOn(obj, cal) {
    const iterator = iter(obj)(cal);

    if (!iterator.hasNext())
        return false;

    return iterator.next().status === 'available';
}
