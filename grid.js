var Point = function Point(x, y) {
    this.x = x;
    this.y = y;

    this.equals = function(point) {
        return this.x == point.x && this.y == point.y;
    };
};
Point.prototype.toString = function pointToString() {
    return '(' + this.x + ', ' + this.y + ')';
};


var BlockCell = function BlockCell(point) {
    this.location = point;
    this.clear = false;
};
BlockCell.prototype.toString = function blockCellToString() {
    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
};


var WalledCell = function WalledCell(point) {

    this.location = point;

    // TODO inherit from BlockCell
    this.clear = false;
    this.walls = [true, true, true, true];

    // TODO Should this also set clear=false? If so, add a reset to BlockCell
    this.reset = function() {
        this.walls[0] = true;
        this.walls[1] = true;
        this.walls[2] = true;
        this.walls[3] = true;
    };
};
WalledCell.prototype.toString = function walledCellToString() {
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

    this.getCell = function(point) {
        if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
            return null;
        }

        return this.cells[point.x][point.y];
    };

    this.getNeighbours = function(point) {
        var neighbours = [];

        for (var direction = 0; direction < 4; direction++) {
            var newX = point.x;
            var newY = point.y;

            // TODO Move into point
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
            var neighbour = this.getCell(new Point(newX, newY));
            if (neighbour != null) {
                neighbours.push(neighbour);
            }
        }

        return neighbours;
    };

    this.clearCell = function(location) {
        this.cells[location.x][location.y].clear = true;
    };

    this.clearPath = function(from, to) {
        // TODO Assume cells are adjacent
        var fromCell = this.cells[from.x][from.y];
        var toCell = this.cells[to.x][to.y];

        fromCell.clear = true;
        toCell.clear = true;
    };

    this.fillCell = function(point) {
        var cell = this.cells[point.x][point.y];
        cell.clear = false;
    };
};

var WalledGrid = function WalledGrid(width, height) {

    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (var x = 0; x < this.cells.length; x++) {
        this.cells[x] = new Array(height);
        for (var y = 0; y < this.cells[x].length; y++) {
            this.cells[x][y] = new WalledCell(new Point(x, y));
        }
    }

    this.getCell = function(point) {
        if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
            return null;
        }

        return this.cells[point.x][point.y];
    };

    this.getNeighbours = function(point) {
        var neighbours = [];

        for (var direction = 0; direction < 4; direction++) {
            var newX = point.x;
            var newY = point.y;

            // TODO Move into point
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
            var neighbour = this.getCell(new Point(newX, newY));
            if (neighbour != null) {
                neighbours.push(neighbour);
            }
        }

        return neighbours;
    };

    this.clearCell = function(point) {
        this.cells[point.x][point.y].clear = true;
    };

    // TODO better name!
    // TODO Pass cell or points?
    this.clearPath = function(from, to) {

        var fromCell = this.cells[from.x][from.y];
        var toCell = this.cells[to.x][to.y];

        fromCell.clear = true;
        toCell.clear = true;

        var direction;
        // TODO Assume cells are immediately adjacent
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

    this.fillCell = function(point) {

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

    this.reverseDirection = function(direction) {
        return (direction + 2) % 4;
    };
};