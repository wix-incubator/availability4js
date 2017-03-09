export default function isAvailableOn(iterator, moment) {
    if (!iterator.hasNext())
        return false;

    return iterator.next().status === 'available';
}
