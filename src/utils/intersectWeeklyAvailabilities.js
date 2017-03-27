import _ from 'lodash';
import {intersectIntervals} from 'interval-utils';

export default function IntersectWeeklyAvailabilities(a1, a2) {
    const a1Weekly = availabilityToWeekly(a1);
    const a2Weekly = availabilityToWeekly(a2);

    if (!_.size(a1Weekly) && _.size(a2Weekly))
        return a2;

    if (!_.size(a2Weekly) && _.size(a1Weekly))
        return a1;

    const i1 = weeklyAvailabilityToIntervals(a1Weekly);
    const i2 = weeklyAvailabilityToIntervals(a2Weekly);

    const intersection = intersectIntervals(i1, i2);
    const intersectionAvailability = intervalsToAvailability(intersection);
    return intersectionAvailability;
}

function availabilityToWeekly(availability) {
    return availability ? availability.weekly : [];
}

function weeklyAvailabilityToIntervals(weekly) {
    return _.map(weekly, availabilityRangeToInterval);
}

function availabilityRangeToInterval({minuteOfWeek, durationMins}) {
    return [minuteOfWeek, minuteOfWeek + durationMins];
}

function intervalsToAvailability(intervals) {
    const durations = _.map(intervals, i => ({
        minuteOfWeek: i[0],
        durationMins: i[1] - i[0]
    }));

    return { weekly: durations };
}
