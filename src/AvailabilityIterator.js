var MergingStatusIterator = require("./MergingStatusIterator.js");
var TimeWindowsIterator = require("./TimeWindowsIterator.js");

module.exports = function(params) {
	params = params || {};
	var av = params.availability || null; // availability.Availability
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	var it = new MergingStatusIterator({
		it : new TimeWindowsIterator({
			availability : av,
			cal : cal
		})
	});

	/** @return Boolean */
	self.hasNext = function() {
		return it.hasNext();
	};
	
	/** @return Status */
	self.next = function() {
		return it.next();
	};
	
	return self;
};
