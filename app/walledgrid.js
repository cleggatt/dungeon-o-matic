"use strict";

var Point = require("./point.js");

var reverseDirection = function(direction) {
    return (direction + 2) % 4;
};

var WalledCell = function WalledCell(point) {
    this.location = point;
    this.clear = false;
    this.walls = [true, true, true, true];
};
// TODO Should this also set clear=false? If so, add a reset to BlockCell
WalledCell.prototype.reset = function() {
    this.walls[0] = true;
    this.walls[1] = true;
    this.walls[2] = true;
    this.walls[3] = true;
};
WalledCell.prototype.toString = function() {
    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
};

var WalledGrid = function(width, height) {

    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (var x = 0; x < this.cells.length; x++) {
        this.cells[x] = new Array(height);
        for (var y = 0; y < this.cells[x].length; y++) {
            var point = new Point(x, y);
            this.cells[x][y] = new WalledCell(point);
        }
    }
};
WalledGrid.prototype.getCell = function(point) {
    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return null;
    }

    return this.cells[point.x][point.y];
};
WalledGrid.prototype.getAdjacentNeighbours = function(point) {
    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));
    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

    return neighbours;
};
WalledGrid.prototype.getAllNeighbours = function(point) {

    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[0] = this.getCell(new Point(point.x - 1, point.y - 1));
    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
    neighbours[2] = this.getCell(new Point(point.x + 1, point.y - 1));

    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));

    neighbours[4] = this.getCell(new Point(point.x + 1, point.y + 1));
    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
    neighbours[6] = this.getCell(new Point(point.x - 1, point.y + 1));

    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

    return neighbours;
};
WalledGrid.prototype.clearCell = function(point) {
    this.cells[point.x][point.y].clear = true;
};
// TODO Pass cell or points?
WalledGrid.prototype.clearPath = function(from, to) {

    var fromCell = this.cells[from.x][from.y];
    var toCell = this.cells[to.x][to.y];

    fromCell.clear = true;
    toCell.clear = true;

    var direction;
    // TODO Check that cells are adjacent
    if (from.y > to.y) {
        direction = 0;
    } else if (from.x < to.x) {
        direction = 1;
    } else if (from.y < to.y) {
        direction = 2;
    } else { // from.x > to.x
        direction = 3;
    }

    fromCell.walls[direction] = false;
    toCell.walls[reverseDirection(direction)] = false;
};
WalledGrid.prototype.fillCell = function(point) {

    var cell = this.cells[point.x][point.y];

    // We need to fill our open wall AND our neighbours open wall
    // If a wall is gone, we know the cell exists
    if (!cell.walls[0]) {
        this.cells[cell.location.x][cell.location.y - 1].walls[reverseDirection(0)] = true;
    }
    if (!cell.walls[1]) {
        this.cells[cell.location.x + 1][cell.location.y].walls[reverseDirection(1)] = true;
    }
    if (!cell.walls[2]) {
        this.cells[cell.location.x][cell.location.y + 1].walls[reverseDirection(2)] = true;
    }
    if (!cell.walls[3]) {
        this.cells[cell.location.x - 1][cell.location.y].walls[reverseDirection(3)] = true;
    }

    cell.clear = false;
    cell.reset();
};

module.exports = WalledGrid;