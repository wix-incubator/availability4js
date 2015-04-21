module.exports = function(params) {
	params = params || {};
	
	var self = {};
	
	self.advance = function(cal, field, amount) {
		switch (field) {
			case  "hour":
				cal.setHours(cal.getHours() + amount);
				break;
			case  "day":
				cal.setDate(cal.getDate() + amount);
				break;
			default:
				throw new Error("Unsupported field: " + field);
		}
	};
	
	return self;
};
