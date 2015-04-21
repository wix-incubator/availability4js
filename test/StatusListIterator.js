module.exports = function(params) {
	params = params || {};
	var statuses = params.statuses || []; // List<Status>
	
	var self = {};
	
	var i = 0;
	
	self.hasNext = function() {
		return (i < statuses.length);
	};
	
	self.next = function() {
		return statuses[i++];
	};
	
	return self;
};
