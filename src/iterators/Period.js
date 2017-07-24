export class Period {
    constructor({days = 0, hours = 0, minutes = 0}) {
        this.days = days;
        this.hours = hours;
        this.minutes = minutes;
    }
    getDays() {
        return this.days;
    }
    getHours() {
        return this.hours;
    }
    getMinutes() {
        return this.minutes;
    }
    toStandardMinutes() {
        return (this.days * 24 + this.hours) * 60 + this.minutes;
    }
    plus({days, hours, minutes}) {
        return new Period({
            days: this.days + (days || 0),
            hours: this.hours + (hours || 0),
            minutes: this.minutes + (minutes || 0)
        });
    }
    plusMinutes(minutesDiff) {
        return this.plus({
            minutes: minutesDiff
        });
    }
    normalizedStandard() {
        let normalizedDays = this.days;
        let normalizedHours = this.hours;
        let normalizedMinutes = this.minutes;

        const extraHours = Math.floor(normalizedMinutes / 60);
        normalizedMinutes -= (60 * extraHours);
        normalizedHours += extraHours;

        const extraDays = Math.floor(normalizedHours / 24);
        normalizedHours -= (24 * extraDays);
        normalizedDays += extraDays;

        return new Period({
            days: normalizedDays,
            hours: normalizedHours,
            minutes: normalizedMinutes
        });
    }
}
