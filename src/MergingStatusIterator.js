"use strict"

export class MergingStatusIterator {
	constructor({it}) {
		it = it || null // Iterator<Status>
		
		this._it = it
		this._nextStatus = ((this._it !== null) && (this._it.hasNext())) ? this._it.next() : null
	}
	
	hasNext() {
		return (this._nextStatus != null)
	}
	
	/** @return Status */
	next() {
		let mergedStatus = this._nextStatus
		while (true) {
			if (!this._it.hasNext()) {
				this._nextStatus = null
				break
			}
			this._nextStatus = this._it.next()
			if (!this._statusEqualsIgnoreUntil(this._nextStatus, mergedStatus)) {
				break
			}
			mergedStatus.until = this._nextStatus.until
		}
		return mergedStatus
	}
	
	_stringMapEquals(map1, map2) {
	    if (!map1) {
	    	return (map2 ? false : true)
	    } else if (!map2) {
	    	return false
	    }
	    
	    for (let key in map1) {
	        if (map1[key] !== map2[key]) {
	            return false
	        }
	    }
	    for (let key in map2) {
	        if (map2[key] !== map1[key]) {
	            return false
	        }
	    }
	    return true
	}
	
	_statusEqualsIgnoreUntil(status1, status2) {
	    return ((status1.status === status2.status) &&
	    		(status1.reason === status2.reason) &&
	    		(this._stringMapEquals(status1.comment, status2.comment)))
	}
}
