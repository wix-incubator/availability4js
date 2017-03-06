export default function isDateAvailable(cal, iterator) {
    while (iterator.hasNext()) {
        const cur = iterator.next();

        if (cur.status === 'available')
            return true;

        if (cur.until > cal.clone().endOf('d').unix() * 1000)
            return false;
    }

    return false;
}
