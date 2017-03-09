export default function isAlwaysAvailable(iterator) {
    if (!iterator.hasNext())
        return false;

    const next = iterator.next();
    return next.status === 'available' && !next.until;
}
