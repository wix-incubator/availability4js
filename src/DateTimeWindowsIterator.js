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

	/**
	 * @param date   availability.Date
	 * @return Long
	 */
	function getTime(date) {
		return new timezoneJS.Date(date.year, date.month - 1, date.day, date.hour, date.minute, tz).getTime();
	}

	var tz = cal.getTimezone();
	var index = null;
	if (timeWindows.length > 0) {
		var timestamp = cal.getTime();
		// TODO: use binary search
		for (var i = 0, l = timeWindows.length; i < l; ++i) {
			var timeWindow = timeWindows[i];
			if (timestamp < getTime(timeWindow.start)) {
				index = new Index(i, true);
				break;
			} else if (timestamp < getTime(timeWindow.end)) {
				index = new Index(i, false);
				break;
			}
		}
		if (index === null) {
			index = new Index(timeWindows.length, true);
		}
	} else {
		index = new Index(0, true);
	}
	
	/** @return Boolean */
	self.hasNext = function() {
		return (index.isDummyBefore || (index.index < timeWindows.length));
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
