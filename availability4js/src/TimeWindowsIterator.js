var availability = availability || {};

availability.TimeWindowsIterator = availability.TimeWindowsIterator || function(params) { return (function(params) {
	params = params || {};
	var av = params.availability || null; // availability.Availability
	var cal = params.cal || null; // timezoneJS.Date
	
	var self = {};
	
	var regularIt = new availability.WeeklyTimeWindowsIterator({
		cal : cal,
		weekly : av.weekly
	});
	var exceptionsIt = new availability.DateTimeWindowsIterator({
		cal : cal,
		timeWindows : av.exceptions
	});
	
	// TimeWindow iterators always return at least one element
	var regularStatus = regularIt.next();
	var exceptionStatus = exceptionsIt.next();
	var hasNext = true;

	/** @return Boolean */
	self.hasNext = function() {
		return hasNext;
	};
	
	/** @return Status */
	self.next = function() {
		// Future has no exceptions?
		if (!exceptionStatus.until) {
			// Continue with regular statuses
			var lastRegularStatus = regularStatus;
			if (regularIt.hasNext()) {
				regularStatus = regularIt.next();
			} else {
				hasNext = false;
			}
			return lastRegularStatus;
		}
		
		// So we do have real exceptions to deal with
		
		// Real exceptions take precedent
		if (availability.STATUS_UNKNOWN !== exceptionStatus.status) {
			var lastExceptionStatus = exceptionStatus;
			exceptionStatus = exceptionsIt.next(); // we know there are still real exceptions later
			
			while ((regularStatus.until) && (regularStatus.until <= lastExceptionStatus.until)) {
				regularStatus = regularIt.next();
			}
			
			return lastExceptionStatus;
		}
		
		// No real exception this time
		if ((!regularStatus.until) || (regularStatus.until > exceptionStatus.until)) {
			var lastExceptionStatus = exceptionStatus;
			exceptionStatus = exceptionsIt.next(); // we know there are still real exceptions later
			return {
				status: regularStatus.status,
				until: lastExceptionStatus.until
			};
		} else if (regularStatus.until < exceptionStatus.until) {
			var lastRegularStatus = regularStatus;
			regularStatus = regularIt.next(); // we know there are still regular statuses later
			return lastRegularStatus;
		} else {
			exceptionStatus = exceptionsIt.next(); // we know there are still real exceptions later
			var lastRegularStatus = regularStatus;
			regularStatus = regularIt.next(); // we know there are still regular statuses later
			return lastRegularStatus;
		}
	};
	
	return self;
}(params))};