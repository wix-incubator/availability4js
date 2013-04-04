var availability = availability || {};

availability.HOUR      = 60;
availability.DAY       = availability.HOUR * 24;
availability.WEEK      = availability.DAY  * 7;

availability.SUNDAY    = availability.DAY  * 0;
availability.MONDAY    = availability.DAY  * 1;
availability.TUESDAY   = availability.DAY  * 2;
availability.WEDNESDAY = availability.DAY  * 3;
availability.THURSDAY  = availability.DAY  * 4;
availability.FRIDAY    = availability.DAY  * 5;
availability.SATURDAY  = availability.DAY  * 6;

availability.WeeklyTimeWindowsIterator = availability.WeeklyTimeWindowsIterator || function(params) { return (function(params) {
	params = params || {};
	var weekly = params.weekly || []; // List<WeeklyTimeWindow>
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	var hasNext = true;
	var timeWindows = [];
	var isFirstAndLastSame = null;
	
	if (weekly.length === 0) {
		timeWindows.push({
			minuteOfWeek : 0,
			durationMins : availability.WEEK,
			status : availability.STATUS_AVAILABLE
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
					status : availability.STATUS_UNAVAILABLE
				});
			}
			timeWindows.push({
				minuteOfWeek : timeWindow.minuteOfWeek,
				durationMins : timeWindow.durationMins,
				status : availability.STATUS_AVAILABLE
			});
			minuteOfWeek = endMinuteOfWeek(timeWindow);
		}
		if (minuteOfWeek < availability.WEEK) {
			timeWindows.push({
				minuteOfWeek : minuteOfWeek,
				durationMins : availability.WEEK - minuteOfWeek,
				status : availability.STATUS_UNAVAILABLE
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
		if (newMinuteOfWeek === availability.WEEK) {
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
			minutesToAdvance += availability.WEEK;
		}
		
		// The craziness ahead is required to support DST (causing some dates to be invalid)
		var targetDate = new availability.Period({
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
	 * TODO: use binary search
	 * @param minuteOfWeek   Integer
	 * @return Integer index in timeWindows member
	 */
	function find(minuteOfWeek) {
		for (var i = 0, l = timeWindows.length; i < l; ++i) {
			if (endMinuteOfWeek(timeWindows[i]) > minuteOfWeek) {
				return i;
			}
		}
		
		throw new Error("Unexpected weekly windows");
	}
	
	/**
	 * @param cal   timezoneJS.Date
	 * @return Integer
	 */
	function minutesFromStartOfWeek(cal) {
		return (cal.getDay() - availability.SUNDAY) * availability.DAY +
			cal.getHours() * availability.HOUR +
			cal.getMinutes();
	}
	
	return self;
}(params))};
