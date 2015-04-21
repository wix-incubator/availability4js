var Status = require("./Status.js");
var Period = require("./Period.js");

var HOUR      = 60;
var DAY       = HOUR * 24;
var WEEK      = DAY  * 7;

var SUNDAY    = DAY  * 0;
var MONDAY    = DAY  * 1;
var TUESDAY   = DAY  * 2;
var WEDNESDAY = DAY  * 3;
var THURSDAY  = DAY  * 4;
var FRIDAY    = DAY  * 5;
var SATURDAY  = DAY  * 6;

module.exports = function(params) {
	params = params || {};
	var weekly = params.weekly || []; // List<WeeklyTimeWindow>
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	cal = cal.clone(); // "cal" is modified later, this allows the caller to reuse his version of it
	
	var hasNext = true;
	var timeWindows = [];
	var isFirstAndLastSame = null;
	
	if (weekly.length === 0) {
		timeWindows.push({
			minuteOfWeek : 0,
			durationMins : WEEK,
			status : Status.STATUS_AVAILABLE
		});
		isFirstAndLastSame = true;
	} else {
		var minuteOfWeek = 0;
		for (var i = 0, l = weekly.length; i < l; ++i) {
			var timeWindow = weekly[i];
			if (timeWindow.minuteOfWeek > minuteOfWeek) {
				timeWindows.push({
					minuteOfWeek : minuteOfWeek,
					durationMins : timeWindow.minuteOfWeek - minuteOfWeek,
					status : Status.STATUS_UNAVAILABLE
				});
			}
			timeWindows.push({
				minuteOfWeek : timeWindow.minuteOfWeek,
				durationMins : timeWindow.durationMins,
				status : Status.STATUS_AVAILABLE
			});
			minuteOfWeek = endMinuteOfWeek(timeWindow);
		}
		if (minuteOfWeek < WEEK) {
			timeWindows.push({
				minuteOfWeek : minuteOfWeek,
				durationMins : WEEK - minuteOfWeek,
				status : Status.STATUS_UNAVAILABLE
			});
		}
		
		var firstWindow = timeWindows[0];
		var lastWindow = timeWindows[timeWindows.length - 1];
		isFirstAndLastSame = (firstWindow.status === lastWindow.status);
	}
	
	var isConstant = (timeWindows.length === 1);
	
	/**
	 * @param timeWindow   WeeklyTimeWindow 
	 * @return Integer 
	 */
	function endMinuteOfWeek(timeWindow) {
		return timeWindow.minuteOfWeek + timeWindow.durationMins;
	};
	
	/** @return Boolean */
	self.hasNext = function() {
		return hasNext;
	};
	
	/** @return Status */
	self.next = function() {
		if (isConstant) {
			hasNext = false;
			return {
				status: timeWindows[0].status,
				until : null
			};
		}
		
		var minuteOfWeek = minutesFromStartOfWeek(cal);
		var currentWindow = timeWindows[find(minuteOfWeek)];
		var newMinuteOfWeek = endMinuteOfWeek(currentWindow);
		if (newMinuteOfWeek === WEEK) {
			newMinuteOfWeek = (isFirstAndLastSame ? endMinuteOfWeek(timeWindows[0]) : 0);
		}
		
		newMinuteOfWeek = advanceCalendar(minuteOfWeek, newMinuteOfWeek);
		return {
			status : currentWindow.status,
			until: cal.getTime()
		};
	};
	
	/**
	 * @param oldMinuteOfWeek   Integer
	 * @param newMinuteOfWeek   Integer
	 * @return Integer
	 */
	function advanceCalendar(oldMinuteOfWeek, newMinuteOfWeek) {
		var minutesToAdvance = newMinuteOfWeek - oldMinuteOfWeek;
		if (minutesToAdvance < 0) {
			minutesToAdvance += WEEK;
		}
		
		// The craziness ahead is required to support DST (causing some dates to be invalid)
		var targetDate = new Period({
			days : cal.getDate(),
			hours : cal.getHours(),
			minutes : cal.getMinutes()
		}).plusMinutes(minutesToAdvance).normalizedStandard();
		
		while (true) {
			cal.setDate(targetDate.getDays());
			cal.setHours(targetDate.getHours());
			cal.setMinutes(targetDate.getMinutes());
			cal.setSeconds(0);
			cal.setMilliseconds(0);
			
			if ((cal.getHours() === targetDate.getHours()) && (cal.getMinutes() === targetDate.getMinutes())) {
				break;
			}
			
			targetDate = targetDate.plusMinutes(1).normalizedStandard();
			++newMinuteOfWeek;
		}
		
		return newMinuteOfWeek;
	};
	
	/**
	 * @param minuteOfWeek   Integer
	 * @return Integer index in timeWindows member
	 */
	function find(minuteOfWeek) {
		// timeWindows are assumed to be sorted, so we can use binary search
		var low = 0;
		var high = timeWindows.length;
		
		while (low < high) {
			var mid = (low + high) >>> 1;
			var midValue = endMinuteOfWeek(timeWindows[mid]);
			if (midValue <= minuteOfWeek) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		
		return low;
	}
	
	/**
	 * @param cal   timezoneJS.Date
	 * @return Integer
	 */
	function minutesFromStartOfWeek(cal) {
		return (cal.getDay() - SUNDAY) * DAY +
			cal.getHours() * HOUR +
			cal.getMinutes();
	}
	
	return self;
};
