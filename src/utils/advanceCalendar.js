import {HOUR, DAY, WEEK} from '../iterators/WeeklyTimeWindow';

const millisInMinute = 1000 * 60;

const getMillisOfMinute = cal => cal.second() * 1000 + cal.millisecond();

const getMinuteOfWeek = cal => cal.day() * DAY + cal.hour() * HOUR + cal.minute();

const isConsecutive = (minuteOfWeek1, minuteOfWeek2) => (minuteOfWeek1 + 1 - minuteOfWeek2) % WEEK === 0;

const advanceCalendar = (cal, toMinuteOfWeek) => {
    const millisOfMinute = getMillisOfMinute(cal);
    if (millisOfMinute > 0) {
        cal.add(millisInMinute - millisOfMinute, 'millisecond');
    }

    let currentMinuteOfWeek = getMinuteOfWeek(cal);

    let minutesToAdvance = toMinuteOfWeek - currentMinuteOfWeek;
    if (minutesToAdvance < 0) {
        minutesToAdvance += WEEK;
    }

    // Optimization: start optimistic (assume no DST)
    cal.add(minutesToAdvance, 'minute');
    if (getMinuteOfWeek(cal) === toMinuteOfWeek) {
        return;
    }
    cal.add(-minutesToAdvance, 'minute');

    // Optimism failed, find that DST change moment
    for (let i = 0; i < minutesToAdvance; ++i) {
        const previousMinuteOfWeek = currentMinuteOfWeek;
        cal.add(1, 'minute');
        currentMinuteOfWeek = getMinuteOfWeek(cal);
        if (!isConsecutive(previousMinuteOfWeek, currentMinuteOfWeek)) {
            break;
        }
    }
};

export default advanceCalendar;
