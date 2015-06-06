// TODO Check what can be module-private
var GRID = GRID || {};

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
}
GRID.BlockGrid.prototype.getCell = function(point) {
    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
        return null;
    }

    return this.cells[point.x][point.y];
};
GRID.BlockGrid.prototype.getNeighbours = function(point) {
    var neighbours = [];

    for (var direction = 0; direction < 4; direction++) {
        var newX = point.x;
        var newY = point.y;

        // TODO Should we move this into grid or Point or Cell?
        if (direction == 0) {
            newY--;
        } else if (direction == 1) {
            newX++;
        } else if (direction == 2) {
            newY++;
        } else { // (direction == 3)
            newX--;
        }

        // TODO create getCell(x, y)?
        var neighbour = this.getCell(new GRID.Point(newX, newY));
        if (neighbour != null) {
            neighbours.push(neighbour);
        }
    }

    return neighbours;
};
GRID.BlockGrid.prototype.clearCell = function(location) {
    this.cells[location.x][location.y].clear = true;
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
GRID.WalledGrid.prototype.getNeighbours = function(point) {
    var neighbours = [];

    for (var direction = 0; direction < 4; direction++) {
        var newX = point.x;
        var newY = point.y;

        // TODO Move into Point or Cell?
        if (direction == 0) {
            newY--;
        } else if (direction == 1) {
            newX++;
        } else if (direction == 2) {
            newY++;
        } else { // (direction == 3)
            newX--;
        }

        // TODO create getCell(x, y)
        var neighbour = this.getCell(new GRID.Point(newX, newY));
        if (neighbour != null) {
            neighbours.push(neighbour);
        }
    }

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