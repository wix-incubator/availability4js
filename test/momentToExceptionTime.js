export default function momentToExceptionTime(time) {
    return {
        year   : time.year(),
        month  : time.month() + 1,
        day    : time.date(),
        hour   : time.hour(),
        minute : time.minute()
    };
}
