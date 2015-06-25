var GRID = require('../app/grid.js');

describe("A point", function() {
    it("should equal itself", function() {
        // Set up
        var p1 = new GRID.Point(17, 42);

        // Exercise
        var result = p1.equals(p1);

        // Verify
        expect(result).toBe(true, 'The result of p1.equals(p1)');
    });
    it("should equal another point with the same x and y coordinates", function() {
        // Set up
        var p1 = new GRID.Point(17, 42);
        var p2 = new GRID.Point(17, 42);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(true, 'The result of p1.equals(p2)');
    });
    it("should have another point with the same x and y coordinates be equal to it", function() {
        // Set up
        var p1 = new GRID.Point(17, 42);
        var p2 = new GRID.Point(17, 42);

        // Exercise
        var result = p2.equals(p1);

        // Verify
        expect(result).toBe(true, 'The result of 21.equals(12)');
    });
    it("should not equal another point with the same x but a different y coordinate", function() {
        // Set up
        var p1 = new GRID.Point(17, 42);
        var p2 = new GRID.Point(17, 24);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(false, 'The result of p1.equals(p2)');
    });
    it("should not equal another point with a differnt x but the same y coordinate", function() {
        // Set up
        var p1 = new GRID.Point(17, 42);
        var p2 = new GRID.Point(71, 42);

        // Exercise
        var result = p1.equals(p2);

        // Verify
        expect(result).toBe(false, 'The result of p1.equals(p2)');
    });
});