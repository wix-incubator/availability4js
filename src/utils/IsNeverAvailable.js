export default function isAlwaysClosed(iterator) {
    if (!iterator.hasNext())
        return false;

    const next = iterator.next();
    return next.status === 'unavailable' && !next.until;
}
