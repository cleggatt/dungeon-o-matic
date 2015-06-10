// TODO Check what can be module-private
var GRID = GRID || {};

GRID.toString = function(o) {
    if (o instanceof Array) {
        var buff = "";
        for (var idx = 0; idx < o.length; idx++) {
            var item = o[idx];
            if (item) {
                buff += o[idx].toString() + ', ';
            } else {
                buff += 'null, ';
            }
        }
        return buff.slice(0, -2);

    } else {
        return o.toString()
    }
};

GRID.Point = function(x, y) {
    this.x = x;
    this.y = y;
};
GRID.Point.prototype.equals = function(otherPoint) {
    return this.x == otherPoint.x && this.y == otherPoint.y;
};
GRID.Point.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
};

GRID.Rect = function(point, width, height) {
    this.location = point;
    this.width = width;
    this.height = height;
};
GRID.Rect.prototype.intersection = function(rect, border, gap) {

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
GRID.Rect.prototype.toString = function() {
    return this.width + 'x' + this.height + ' at ' +  this.location;
};

GRID.BlockCell = function(point) {
    this.location = point;
    this.clear = false;
};
GRID.BlockCell.prototype.toString = function() {
    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
};

GRID.WalledCell = function(point) {
    this.location = point;
    this.clear = false;
    this.walls = [true, true, true, true];
};
// TODO Should this also set clear=false? If so, add a reset to BlockCell
GRID.WalledCell.prototype.reset = function() {
    this.walls[0] = true;
    this.walls[1] = true;
    this.walls[2] = true;
    this.walls[3] = true;
};
GRID.WalledCell.prototype.toString = function() {
    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
};

GRID.BlockGrid = function(width, height) {
    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (var x = 0; x < this.cells.length; x++) {
        this.cells[x] = new Array(height);
        for (var y = 0; y < this.cells[x].length; y++) {
            this.cells[x][y] = new GRID.BlockCell(new GRID.Point(x, y));
        }
    }
};
GRID.BlockGrid.prototype.clone = function() {
    // TODO This could be more efficient and just initialise the cells on creation
    var clone = new GRID.BlockGrid(this.width, this.height);
    for (var x = 0; x < this.cells.length; x++) {
        for (var y = 0; y < this.cells[x].length; y++) {
            clone.cells[x][y].clear = this.cells[x][y].clear;
        }
    }
    return clone;
};
GRID.BlockGrid.prototype.getCell = function(point) {
    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return null;
    }

    return this.cells[point.x][point.y];
};
GRID.BlockGrid.prototype.getAdjacentNeighbours = function(point) {
    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[1] = this.getCell(new GRID.Point(point.x, point.y - 1));
    neighbours[3] = this.getCell(new GRID.Point(point.x + 1, point.y));
    neighbours[5] = this.getCell(new GRID.Point(point.x, point.y + 1));
    neighbours[7] = this.getCell(new GRID.Point(point.x - 1, point.y));

    return neighbours;
};
GRID.BlockGrid.prototype.getAllNeighbours = function(point) {

    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[0] = this.getCell(new GRID.Point(point.x - 1, point.y - 1));
    neighbours[1] = this.getCell(new GRID.Point(point.x, point.y - 1));
    neighbours[2] = this.getCell(new GRID.Point(point.x + 1, point.y - 1));

    neighbours[3] = this.getCell(new GRID.Point(point.x + 1, point.y));

    neighbours[4] = this.getCell(new GRID.Point(point.x + 1, point.y + 1));
    neighbours[5] = this.getCell(new GRID.Point(point.x, point.y + 1));
    neighbours[6] = this.getCell(new GRID.Point(point.x - 1, point.y + 1));

    neighbours[7] = this.getCell(new GRID.Point(point.x - 1, point.y));

    return neighbours;
};
GRID.BlockGrid.prototype.clearCell = function(location) {
    this.cells[location.x][location.y].clear = true;
};
// TODO Change to take Rect
GRID.BlockGrid.prototype.clearCells = function(location, width, height) {
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            this.cells[location.x + i][location.y + j].clear = true;
        }
    }
};
GRID.BlockGrid.prototype.clearPath = function(from, to) {
    // TODO Check that cells are adjacent
    var fromCell = this.cells[from.x][from.y];
    var toCell = this.cells[to.x][to.y];

    fromCell.clear = true;
    toCell.clear = true;
};
GRID.BlockGrid.prototype.fillCell = function(point) {
    var cell = this.cells[point.x][point.y];
    cell.clear = false;
};


GRID.WalledGrid = function(width, height) {

    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (var x = 0; x < this.cells.length; x++) {
        this.cells[x] = new Array(height);
        for (var y = 0; y < this.cells[x].length; y++) {
            this.cells[x][y] = new GRID.WalledCell(new GRID.Point(x, y));
        }
    }
};
GRID.WalledGrid.prototype.getCell = function(point) {
    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return null;
    }

    return this.cells[point.x][point.y];
};
GRID.WalledGrid.prototype.getAdjacentNeighbours = function(point) {
    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[1] = this.getCell(new GRID.Point(point.x, point.y - 1));
    neighbours[3] = this.getCell(new GRID.Point(point.x + 1, point.y));
    neighbours[5] = this.getCell(new GRID.Point(point.x, point.y + 1));
    neighbours[7] = this.getCell(new GRID.Point(point.x - 1, point.y));

    return neighbours;
};
GRID.WalledGrid.prototype.getAllNeighbours = function(point) {

    var neighbours = [ null, null, null, null, null, null, null, null];

    neighbours[0] = this.getCell(new GRID.Point(point.x - 1, point.y - 1));
    neighbours[1] = this.getCell(new GRID.Point(point.x, point.y - 1));
    neighbours[2] = this.getCell(new GRID.Point(point.x + 1, point.y - 1));

    neighbours[3] = this.getCell(new GRID.Point(point.x + 1, point.y));

    neighbours[4] = this.getCell(new GRID.Point(point.x + 1, point.y + 1));
    neighbours[5] = this.getCell(new GRID.Point(point.x, point.y + 1));
    neighbours[6] = this.getCell(new GRID.Point(point.x - 1, point.y + 1));

    neighbours[7] = this.getCell(new GRID.Point(point.x - 1, point.y));

    return neighbours;
};
GRID.WalledGrid.prototype.clearCell = function(point) {
    this.cells[point.x][point.y].clear = true;
};
// TODO Pass cell or points?
GRID.WalledGrid.prototype.clearPath = function(from, to) {

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
    toCell.walls[this.reverseDirection(direction)] = false;
};
GRID.WalledGrid.prototype.fillCell = function(point) {

    var cell = this.cells[point.x][point.y];

    // We need to fill our open wall AND our neighbours open wall
    // If a wall is gone, we know the cell exists
    if (!cell.walls[0]) {
        this.cells[cell.location.x][cell.location.y - 1].walls[this.reverseDirection(0)] = true;
    }
    if (!cell.walls[1]) {
        this.cells[cell.location.x + 1][cell.location.y].walls[this.reverseDirection(1)] = true;
    }
    if (!cell.walls[2]) {
        this.cells[cell.location.x][cell.location.y + 1].walls[this.reverseDirection(2)] = true;
    }
    if (!cell.walls[3]) {
        this.cells[cell.location.x - 1][cell.location.y].walls[this.reverseDirection(3)] = true;
    }

    cell.clear = false;
    cell.reset();
};
GRID.WalledGrid.prototype.reverseDirection = function(direction) {
    return (direction + 2) % 4;
};