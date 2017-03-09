export default function isAvailableOn(iterator) {
    if (!iterator.hasNext())
        return false;

    return iterator.next().status === 'available';
}
