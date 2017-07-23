import _ from 'lodash';
import * as WeeklyTimeWindow from '../../src/iterators/WeeklyTimeWindow';

const normalize = weekly => {
    if (weekly.length < 2) {
        return weekly;
    }

    const firstWindow = weekly[0];
    if (firstWindow.minuteOfWeek !== 0) {
        return weekly;
    }

    const lastWindow = weekly[weekly.length - 1];
    if (lastWindow.minuteOfWeek + lastWindow.durationMins !== WeeklyTimeWindow.WEEK) {
        return weekly;
    }

    const normalizedWeekly = [];
    for (let i = 1; i < weekly.length - 1; ++i) {
        normalizedWeekly.push(weekly[i]);
    }
    normalizedWeekly.push({
        minuteOfWeek: lastWindow.minuteOfWeek,
        durationMins: lastWindow.durationMins + firstWindow.durationMins
    });
    return normalizedWeekly;
};

const isAlwaysAvailable = weekly => {
    return (!weekly || (weekly.length === 0) || (weekly[0].minuteOfWeek === 0 && weekly[0].durationMins === WeeklyTimeWindow.WEEK));
};

const dailyWindowToString = dailyWindow => {
    return `${dailyWindow.minuteOfDay}+${dailyWindow.durationMins}`;
};

const humanizeWeekly = weekly => {
    if (isAlwaysAvailable(weekly)) {
        return [{
            days: [0, 1, 2, 3, 4, 5, 6],
            window: {
                minuteOfDay: 0,
                durationMins: WeeklyTimeWindow.DAY
            }
        }];
    }

    // Handle overlapping last period
    const normalizedWeekly = normalize(weekly);

    let dailyWindowsByDay = [];
    for (let day = 0; day < 7; ++day) {
        dailyWindowsByDay.push([]);
    }

    // We split > 1day time windows, since we currently don't display Mon 12:00AM - Tuesday 2:00PM. Instead this will be displayed as Mon all day, Tuesday 12AM - 2:00PM
    const weeklyBroken = _.flatMap(normalizedWeekly, timeWindow => {
        const ret = [];
        let {minuteOfWeek, durationMins} = timeWindow;

        while (durationMins > WeeklyTimeWindow.DAY) {
            const newDurationMins = WeeklyTimeWindow.DAY - (minuteOfWeek % WeeklyTimeWindow.DAY);

            // Modulo 10080 because of the normalize
            ret.push({minuteOfWeek: minuteOfWeek % WeeklyTimeWindow.WEEK, durationMins:newDurationMins});

            minuteOfWeek += newDurationMins;
            durationMins -= newDurationMins;
        }

        if (durationMins > 0) {
            ret.push({minuteOfWeek: minuteOfWeek % WeeklyTimeWindow.WEEK, durationMins:durationMins});
        }

        return ret;
    });

    return _(weeklyBroken)
        .map(weeklyWindow => {
            const day = Math.floor(weeklyWindow.minuteOfWeek / WeeklyTimeWindow.DAY);
            return {
                day,
                window: {
                    minuteOfDay: weeklyWindow.minuteOfWeek - day * WeeklyTimeWindow.DAY,
                    durationMins: weeklyWindow.durationMins
                }
            };
        })
        .groupBy(dayAndDailyWindow => dailyWindowToString(dayAndDailyWindow.window))
        .map(dayAndDailyWindows => {
            return {
                days: _.map(dayAndDailyWindows, 'day'),
                window: dayAndDailyWindows[0].window
            };
        })
        .value();
};

export default humanizeWeekly;