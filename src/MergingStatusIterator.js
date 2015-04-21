module.exports = function(params) {
	params = params || {};
	var it = params.it || null; // Iterator<Status>

	var self = {};
	
	var nextStatus = ((it !== null) && (it.hasNext())) ? it.next() : null;
	
	self.hasNext = function() {
		return (nextStatus != null);
	};
	
	function stringMapEquals(map1, map2) {
	    if (!map1) {
	    	return (map2 ? false : true);
	    } else if (!map2) {
	    	return false;
	    }
	    
	    for (var key in map1) {
	        if (map1[key] !== map2[key]) {
	            return false;
	        }
	    }
	    for (var key in map2) {
	        if (map2[key] !== map1[key]) {
	            return false;
	        }
	    }
	    return true;
	}

	function statusEqualsIgnoreUntil(status1, status2) {
	    return ((status1.status === status2.status) &&
	    		(status1.reason === status2.reason) &&
	    		(stringMapEquals(status1.comment, status2.comment)));
	}

	/** @return Status */
	self.next = function() {
		var mergedStatus = nextStatus;
		while (true) {
			if (!it.hasNext()) {
				nextStatus = null;
				break;
			}
			nextStatus = it.next();
			if (!statusEqualsIgnoreUntil(nextStatus, mergedStatus)) {
				break;
			}
			mergedStatus.until = nextStatus.until;
		}
		return mergedStatus;
	};

	return self;
};
