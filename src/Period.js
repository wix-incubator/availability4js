"use strict"

export class Period {
	constructor({days, hours, minutes}) {
		this.days = days || 0
		this.hours = hours || 0
		this.minutes = minutes || 0
	}
	getDays() {
		return this.days
	}
	getHours() {
		return this.hours
	}
	getMinutes() {
		return this.minutes
	}
	toStandardMinutes() {
		return (days * 24 + hours) * 60 + minutes
	}
	plus({days, hours, minutes}) {
		return new Period({
			days: this.days + (days || 0),
			hours: this.hours + (hours || 0),
			minutes: this.minutes + (minutes || 0)
		})
	}
	plusMinutes(minutesDiff) {
		return this.plus({
			minutes: minutesDiff
		})
	}
	normalizedStandard() {
		let normalizedDays = this.days
		let normalizedHours = this.hours
		let normalizedMinutes = this.minutes
		
		let extraHours = Math.floor(normalizedMinutes / 60)
		normalizedMinutes -= (60 * extraHours)
		normalizedHours += extraHours
		
		let extraDays = Math.floor(normalizedHours / 24)
		normalizedHours -= (24 * extraDays)
		normalizedDays += extraDays
		
		return new Period({
			days: normalizedDays,
			hours: normalizedHours,
			minutes: normalizedMinutes
		})
	}
}
