import {AvailabilityIterator} from './AvailabilityIterator';

export default function isDateAvailable(cal, availability) {
    const iterator = new AvailabilityIterator({ cal: cal.clone(), availability });

    while (iterator.hasNext()) {
        const cur = iterator.next();

        if (cur.status === 'available')
            return true;

        if (cur.until > cal.clone().endOf('d').unix() * 1000)
            return false;
    }

    return false;
}
