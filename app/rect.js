var Rect = function Rect(point, width, height) {
    this.location = point;
    this.width = width;
    this.height = height;
    this.area = this.width * this.height;
};
Rect.prototype.intersection = function(rect, border, gap) {

    var x1 = this.location.x - border;
    var x2 = this.location.x + this.width + border;
    var y1 = this.location.y - border;
    var y2 = this.location.y + this.height + border;

    var x3 = rect.location.x - border;
    var x4 = rect.location.x + rect.width + border;
    var y3 = rect.location.y - border;
    var y4 = rect.location.y + rect.height + border;

    var x5 = Math.max(x1, x3);
    var y5 = Math.max(y1, y3);
    var x6 = Math.min(x2, x4);
    var y6 = Math.min(y2, y4);

    // Make sure we have a gap of at least 'gap' pixels or we'll still count it as an intersection
    return !((x5 - x6) >= gap || ((y5 - y6) >= gap));
};
Rect.prototype.toString = function() {
    return this.width + 'x' + this.height + ' at ' +  this.location;
};

module.exports = Rect;