var availability = availability || {};

availability.AvailabilityIterator = availability.AvailabilityIterator || function(params) { return (function(params) {
	params = params || {};
	var av = params.availability || null; // availability.Availability
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	var it = new availability.MergingStatusIterator({
		it : new availability.TimeWindowsIterator({
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
}(params))};
