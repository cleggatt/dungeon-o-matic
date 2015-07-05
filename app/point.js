"use strict";

var Point = function Point(x, y) {
    this.x = x;
    this.y = y;
};
Point.prototype.equals = function(otherPoint) {
    return this.x == otherPoint.x && this.y == otherPoint.y;
};
Point.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
};

module.exports = Point;