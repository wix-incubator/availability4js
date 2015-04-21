var should = require('chai').should();
var AvailabilityIterator = require("../src/AvailabilityIterator.js");
var Status = require("../src/Status.js");
var _ = require("underscore");
var timezoneJS = require('timezone-js');

describe("AvailabilityIterator", function() {
    it ('Should return "forever available" for empty availability', function() {
        var now = new timezoneJS.Date();
        var iterator = new AvailabilityIterator({cal:now, availability:{}});

        iterator.hasNext().should.be.true;

        var next = iterator.next();

        iterator.hasNext().should.be.false;
        next.status.should.equal(Status.STATUS_AVAILABLE);
        should.not.exist(next.until);
    });
});
