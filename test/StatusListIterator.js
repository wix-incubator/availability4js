"use strict"

export class StatusListIterator {
	constructor({statuses}) {
		statuses = statuses || [] // List<Status>
		
		this._statuses = statuses
		this._i = 0
	}
	
	hasNext() {
		return (this._i < this._statuses.length)
	}
	
	next() {
		return this._statuses[this._i++]
	}
}
