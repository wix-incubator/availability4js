export default function isAvailableOn(getIterator, cal) {
    const iterator = getIterator(cal);

    if (!iterator.hasNext())
        return false;

    return iterator.next().status === 'available';
}
