export default function isAvailabilityObject(obj) {
    if (!obj)
        return true;

    const keys = Object.keys(obj);

    return keys.indexOf('weekly') !== -1 || keys.indexOf('exceptions') !== -1 ||
           (Object.keys(obj).length === 0 && typeof obj !== 'function');
}
