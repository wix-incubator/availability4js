export default function isAvailabilityObject(obj) {
    return !obj || obj.weekly || obj.exceptions || (Object.keys(obj).length === 0 && typeof obj !== 'function');
}
