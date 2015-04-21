var Period = function(params) {
	params = params || {};
	var days = params.days || 0;
	var hours = params.hours || 0;
	var minutes = params.minutes || 0; 
	
	var self = {};
	
	self.getDays = function() {
		return days;
	};
	
	self.getHours = function() {
		return hours;
	};
	
	self.getMinutes = function() {
		return minutes;
	};
	
	self.toStandardMinutes = function() {
		return (days * 24 + hours) * 60 + minutes;
	};
	
	self.plus = function(period) {
		return new Period({
			days : days + (period.days || 0),
			hours : hours + (period.hours || 0),
			minutes : minutes + (period.minutes || 0)
		});
	};
	
	self.plusMinutes = function(minutesDiff) {
		return self.plus({
			minutes : minutesDiff
		});
	};
	
	self.normalizedStandard = function() {
		var normalizedDays = days;
		var normalizedHours = hours;
		var normalizedMinutes = minutes;
		
		extraHours = Math.floor(normalizedMinutes / 60);
		normalizedMinutes -= (60 * extraHours);
		normalizedHours += extraHours;
		
		var extraDays = Math.floor(normalizedHours / 24);
		normalizedHours -= (24 * extraDays);
		normalizedDays += extraDays;
		
		return new Period({
			days : normalizedDays,
			hours : normalizedHours,
			minutes : normalizedMinutes
		});
	};
	
	return self;
};

module.exports = Period;
