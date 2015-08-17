var WeeklyTimeWindowsIterator = require("./WeeklyTimeWindowsIterator.js");
var DateTimeWindowsIterator = require("./DateTimeWindowsIterator.js");
var Status = require("./Status.js");

module.exports = function(params) {
	params = params || {};
	var av = params.availability || {}; // availability.Availability
	var cal = params.cal || null; // Moment with tz
	
	var self = {};
	
	var regularIt = new WeeklyTimeWindowsIterator({
		cal : cal,
		weekly : av.weekly
	});
	var exceptionsIt = new DateTimeWindowsIterator({
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
		if (exceptionStatus.status === Status.STATUS_UNKNOWN && !exceptionStatus.until) {
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
		if (Status.STATUS_UNKNOWN !== exceptionStatus.status) {
            // If the exception is indefinite, it trumps everything else
            if (!exceptionStatus.until) {
                hasNext = false;
                return exceptionStatus;
            }
		
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
};
