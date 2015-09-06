"use strict"

export class CalendarAdvancer {
	advance(cal, field, amount) {
		switch (field) {
			case "hour":
				cal.hour(cal.hour() + amount);
				break;
			case "day":
				cal.date(cal.date() + amount);
				break;
			default:
				throw new Error("Unsupported field: " + field);
		}
	}
}
