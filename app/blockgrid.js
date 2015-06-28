var Point = require("./point.js");

var BlockCell = function BlockCell(point) {
    this.location = point;
    this.clear = false;
};
BlockCell.prototype.toString = function() {
    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
};

var BlockGrid = function BlockGrid(width, height) {
    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (var x = 0; x < this.cells.length; x++) {
        this.cells[x] = new Array(height);
        for (var y = 0; y < this.cells[x].length; y++) {
            this.cells[x][y] = new BlockCell(new Point(x, y));
        }
    }
};
BlockGrid.prototype.clone = function() {
    // TODO This could be more efficient and just initialise the cells on creation
    var clone = new BlockGrid(this.width, this.height);
    for (var x = 0; x < this.cells.length; x++) {
        for (var y = 0; y < this.cells[x].length; y++) {
            clone.cells[x][y].clear = this.cells[x][y].clear;
        }
    }
    return clone;
};
BlockGrid.prototype.getCell = function(point) {
    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return null;
    }

    return this.cells[point.x][point.y];
};
BlockGrid.prototype.getAdjacentNeighbours = function(point) {
    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));
    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

    return neighbours;
};
BlockGrid.prototype.getAllNeighbours = function(point) {

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
BlockGrid.prototype.clearCell = function(location) {
    this.cells[location.x][location.y].clear = true;
};
// TODO Change to take Rect
BlockGrid.prototype.clearCells = function(location, width, height) {
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            this.cells[location.x + i][location.y + j].clear = true;
        }
    }
};
BlockGrid.prototype.clearPath = function(from, to) {
    // TODO Check that cells are adjacent
    var fromCell = this.cells[from.x][from.y];
    var toCell = this.cells[to.x][to.y];

    fromCell.clear = true;
    toCell.clear = true;
};
BlockGrid.prototype.fillCell = function(point) {
    var cell = this.cells[point.x][point.y];
    cell.clear = false;
};

module.exports = BlockGrid;