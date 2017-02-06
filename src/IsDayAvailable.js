import AvailabilityIterator from './AvailabilityIterator';

export default function isDateAvailable(cal, availability) {
    const iterator = new AvailabilityIterator({ cal, availability });

    while (iterator.hasNext()) {
        const cur = iterator.next();

        if (cur.status === 'available')
            return true;

        if (cur.until > cal.unix() * 1000)
            return false;
    }

    return false;
}
