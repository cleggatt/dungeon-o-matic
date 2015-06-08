// TODO Check what can be module-private
var FILLER = FILLER || {};

FILLER.ValidWalledCellSelector = function(grid) {
    this.grid = grid;
};
FILLER.ValidWalledCellSelector.prototype.findValidPosition = function(fromPoint) {

    console.log('Finding valid position from ' + fromPoint + '...');

    var direction = this.findSingleExit(this.grid.getCell(fromPoint).walls);
    if (direction != -1) {
        var newX = fromPoint.x;
        var newY = fromPoint.y;

        // TODO Should we move this into grid or Point, Cell or Grid?
        if (direction == 0) {
            newY--;
        } else if (direction == 1) {
            newX++;
        } else if (direction == 2) {
            newY++;
        } else { // (direction == 3)
            newX--;
        }
        var newPosition = new GRID.Point(newX, newY);

        return newPosition;
    } else {
        return null;
    }
};
FILLER.ValidWalledCellSelector.prototype.findSingleExit = function(walls) {

    var lastExit = -1;
    for (var direction = 0; direction < 4; direction++) {
        if (!walls[direction]) {
            if (lastExit == -1) {
                lastExit = direction;
            } else {
                console.log("Multiple exits!");
                return -1;
            }
        }
    }

    if (lastExit == -1) {
        console.log("No exits!");
        return -1;
    }

    return lastExit;
};

FILLER.ValidBlockCellSelector = function(grid) {
    this.grid = grid;
};
FILLER.ValidBlockCellSelector.prototype.findValidPosition = function(fromPoint) {
    var neighbours = this.grid.getAdjacentNeighbours(fromPoint);
    console.log("Finding valid position from: " + neighbours + "...");

    var lastExit = null;
    for (var idx = 0; idx < neighbours.length; idx++) {
        var neighbour = neighbours[idx];
        if (neighbour && neighbour.clear) {
            if (lastExit == null) {
                lastExit = neighbour;
            } else {
                console.log("Multiple clear neighbours!");
                return null;
            }
        }
    }

    return lastExit ? lastExit.location : null;
};

FILLER.DeadEndFiller = function(grid, deadEndPercentage) {
    this.grid = grid;
    // TODO Allow percentage to be % of cells vs % of corridors
    this.deadEndPercentage = deadEndPercentage;

    this.cellSelector = (this.grid instanceof GRID.WalledGrid) ? new FILLER.ValidWalledCellSelector(this.grid) : new FILLER.ValidBlockCellSelector(this.grid);
};
FILLER.DeadEndFiller.prototype.init = function(acc) {

    this.deadEnds = acc.deadEnds.slice(0);
    this.deadEndsToKeep = Math.ceil(this.deadEnds.length * (this.deadEndPercentage / 100));

    this.position = this.pickDeadEnd();
    if (this.position) {
        acc.currentPoint = this.position;
        // TODO Reset once done
        acc.reversing = true;
    }

    return (this.position != null);
};
FILLER.DeadEndFiller.prototype.step = function(acc) {

    var oldPosition = this.position;

    this.position = this.cellSelector.findValidPosition(this.position);
    if (this.position) {
        console.log('Moving to ' + this.position);
        this.fillCell(oldPosition);
    } else {
        console.log("No valid positions!");
        this.position = this.pickDeadEnd();
        if (this.position) {
            console.log('Jumping to ' + this.position);
        }
    }

    acc.currentPoint = this.position;
    return (this.position != null);
};
FILLER.DeadEndFiller.prototype.pickDeadEnd = function() {

    console.log("Finding valid dead end while keeping " + this.deadEndsToKeep);

    if (this.deadEnds.length == 0 || this.deadEnds.length == this.deadEndsToKeep) {
        console.log("No remaining dead ends...");
        return null;
    }

    var idx = Math.floor(Math.random() * this.deadEnds.length);
    var deadEnd = this.deadEnds.splice(idx, 1)[0];
    return deadEnd;
};
// TODO Replace with direct Grid call
FILLER.DeadEndFiller.prototype.fillCell = function(position) {
    console.log("Filling (" + position.x + "," + position.y + ")");
    this.grid.fillCell(position);
};