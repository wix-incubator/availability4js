var Status = require("./Status.js");
var timezoneJS = require('timezone-js');

module.exports = function(params) {
	params = params || {};
	var timeWindows = params.timeWindows || []; // List<DateTimeWindow>
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	/**
	 * @param index           Integer
	 * @param isDummyBefore   Boolean
	 */
	function Index(index, isDummyBefore) {
		this.index = index;
		this.isDummyBefore = isDummyBefore;
	}
	
	Index.prototype.advance = function() {
		if (this.isDummyBefore) {
			this.isDummyBefore = false;
		} else {
			this.isDummyBefore = true;
			++this.index;
		}
	}

	var tz = cal.getTimezone();
	
	/**
	 * @param date   availability.Date
	 * @return Long
	 */
	function getTime(date) {
		if (date === null) {
			return null;
		}
		return new timezoneJS.Date(date.year, date.month - 1, date.day, date.hour, date.minute, tz).getTime();
	}
	
    function strictlyBefore(window1EndTs, window2StartTs) {
        if ((window1EndTs == null) || (window2StartTs == null)) {
            return false;
        }
        return (window1EndTs <= window2StartTs);
    }
	
	function compare(timestamp, timeWindow) {
		if (strictlyBefore(timestamp + 1000, getTime(timeWindow.start))) {
			return -1;
		} else if (strictlyBefore(getTime(timeWindow.end), timestamp)) {
			return 1;
		} else {
			return 0;
		}
	}
	
	/**
	 * @param timeWindows   List<DateTimeWindow>
	 * @param timestamp     Long
	 * @return Index
	 */
	function findInsertionIndex(timeWindows, timestamp) {
		// TODO: use binary search
		for (var i = 0, l = timeWindows.length; i < l; ++i) {
			var timeWindow = timeWindows[i];
			
			var c = compare(timestamp, timeWindow);
			if (c < 0) {
				return new Index(i, true);
			} if (c === 0) {
				return new Index(i, false);
			}
		}
		return new Index(timeWindows.length, true);
	}
	
	var index = null;
	var lastWindowUntilForever = null;
	if (timeWindows.length > 0) {
		index = findInsertionIndex(timeWindows, cal.getTime());
		lastWindowUntilForever = (timeWindows[timeWindows.length-1].end === null);
	} else {
		index = new Index(0, true);
		lastWindowUntilForever = false;
	}
	
	/** @return Boolean */
	self.hasNext = function() {
		if (index.index < timeWindows.length) {
			return true;
		}
		
		return (index.isDummyBefore && !lastWindowUntilForever);
	};

	/** @return Status */
	self.next = function() {
		if (index.index === timeWindows.length) {
			result = {
				status : Status.STATUS_UNKNOWN,
				until : null
			};
		} else {
			var nextTimeWindow = timeWindows[index.index];
			if (!index.isDummyBefore) {
				result = {
					status : (nextTimeWindow.available ? Status.STATUS_AVAILABLE : Status.STATUS_UNAVAILABLE),
					until : getTime(nextTimeWindow.end),
					reason : nextTimeWindow.reason,
					comment : nextTimeWindow.comment
				};
			} else {
				result = {
					status : Status.STATUS_UNKNOWN,
					until : getTime(nextTimeWindow.start)
				};
			}
		}
		
		index.advance();
		return result;
	};
	
	return self;
};
