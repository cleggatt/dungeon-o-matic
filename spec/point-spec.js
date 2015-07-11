/* global describe */
/* global it */
/* global expect */
"use strict";

var Point = require('../app/point.js');

describe("A point", function() {
    it("should equal itself", function() {
        // Set up
        var p1 = new Point(17, 42);

        // Exercise
        var result = p1.equals(p1);

        // Verify
        expect(result).toBe(true, 'The result of p1.equals(p1)');
    });
    it("should equal another point with the same x and y coordinates", function() {
        // Set up
        var p1 = new Point(17, 42);
        var p2 = new Point(17, 42);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(true, 'The result of p1.equals(p2)');
    });
    it("should have another point with the same x and y coordinates be equal to it", function() {
        // Set up
        var p1 = new Point(17, 42);
        var p2 = new Point(17, 42);

        // Exercise
        var result = p2.equals(p1);

        // Verify
        expect(result).toBe(true, 'The result of 21.equals(12)');
    });
    it("should not equal another point with the same x but a different y coordinate", function() {
        // Set
        var p1 = new Point(17, 42);
        var p2 = new Point(17, 24);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(false, 'The result of p1.equals(p2)');
    });
    it("should not equal another point with a different x but the same y coordinate", function() {
        // Set up
        var p1 = new Point(17, 42);
        var p2 = new Point(71, 42);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(false, 'The result of p1.equals(p2)');
    });
    it("should return a string representation of itseld", function() {
        // Set up
        var p1 = new Point(17, 42);

        // Exercise
        var result = p1.toString();

        // Verify
        expect(result).toBe('(17, 42)', 'The result of p1.toString()');
    });
});