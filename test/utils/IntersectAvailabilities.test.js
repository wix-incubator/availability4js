import {expect} from 'chai';
import {intersectWeeklyAvailabilities} from '../../src/index';

describe('AvailabilityIntersection', () => {
    it('simple intersection', () => {
        let i1 = [[0, 10]];
        let i2 = [[4, 13]];
        let e =  [[4, 10]];

        let result = intersect(i1, i2);

        expect(result).to.deep.equal(e);
    });

    it('complex intersection', () => {
        let i1 = [[0, 10], [12, 18], [25, 30]];
        let i2 = [[2, 4], [5, 8], [9, 15], [20, 40], [55, 100]];
        let e =  [[2, 4], [5, 8], [9, 10], [12, 15], [25, 30]];

        let result = intersect(i1, i2);

        expect(result).to.deep.equal(e);
    });
});

//***********************************************
//                  Helpers
//***********************************************

function createAvailability(intervals) {
    function intervalToAvailability([start, end]) {
        return {
            minuteOfWeek: start,
            durationMins: end - start
        };
    }

    let availabilities = intervals.map(intervalToAvailability);

    return {
        weekly: availabilities
    };
}

function createIntervals(availability) {
    function availabilityToInterval({minuteOfWeek, durationMins}) {
        return [minuteOfWeek, minuteOfWeek + durationMins];
    }
    return availability.weekly.map(availabilityToInterval);
}

function intersect(...intervals) {
    let availabilities = intervals.map(createAvailability);
    let result = intersectWeeklyAvailabilities(...availabilities);
    return createIntervals(result);
}
