import {HOUR, DAY, WEEK} from '../iterators/WeeklyTimeWindow';

const millisInMinute = 1000 * 60;

const getMillisOfMinute = cal => cal.second() * 1000 + cal.millisecond();

const getMinuteOfWeek = cal => cal.day() * DAY + cal.hour() * HOUR + cal.minute();


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
    advanceCalendarToClosestDstState(cal, !cal.isDST(), minutesToAdvance);
};

const advanceCalendarToClosestDstState = (cal, targetDstState, step) => {
    while (cal.isDST() !== targetDstState) {
        cal.add(step, 'minute');
    }
    if (step > 1) {
        cal.add(-step, 'minute');

        advanceCalendarToClosestDstState(cal, targetDstState, Math.floor(step / 2));
    }
};

export default advanceCalendar;
