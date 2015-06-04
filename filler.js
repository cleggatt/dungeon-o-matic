// TODO Make private to module
// TODO Rename
// TODO Fix up log messages
var NewValidWalledCellSelector = function ValidBlockCellSelector(grid) {

    this.grid = grid;

    this.findValidPosition = function(fromPoint) {

        console.log('Finding valid position from ' + fromPoint + '...');

        var direction = this.findSingleExit(this.grid.getCell(fromPoint).walls);

        if (direction != -1) {
            var newX = fromPoint.x;
            var newY = fromPoint.y;

            if (direction == 0) {
                newY--;
            } else if (direction == 1) {
                newX++;
            } else if (direction == 2) {
                newY++;
            } else { // (direction == 3)
                newX--;
            }

            var newPosition = new Point(newX, newY);

            console.log('Moving to ' + newPosition);

            return newPosition;
        } else {
            console.log("No valid positions!");
            return null;
        }
    };

    this.findSingleExit = function(walls) {

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
};

// TODO Make private to module
// TODO Rename
// TODO Fix up log messages
var NewValidBlockCellSelector = function NewValidBlockCellSelector(grid) {
    this.grid = grid;

    this.findValidPosition = function(fromPoint) {

        console.log('Finding valid position from ' + fromPoint + '...');

        var newPosition = this.findSingleExit(fromPoint);

        if (newPosition) {
            console.log('Moving to ' + newPosition);
            return newPosition;
        } else {
            console.log("No valid positions!");
            return null;
        }
    };

    // TODO Collapse into calling function
    this.findSingleExit = function(fromPoint) {

        var neighbours = this.grid.getNeighbours(fromPoint);
        console.log("Checking for single clear neighbour: " + neighbours + "...");

        var lastExit = null;
        for (var idx = 0; idx < neighbours.length; idx++) {
            var neighbour = neighbours[idx];
            if (neighbour.clear) {
                if (lastExit == null) {
                    lastExit = neighbour;
                } else {
                    console.log("Multiple clear neighbour!");
                    return null;
                }
            }
        }

        return lastExit ? lastExit.location : null;
    };
};

var DeadEndFiller = function DeadEndFiller(grid, deadendPercentage) {

    this.grid = grid;
    this.deadendPercentage = deadendPercentage;

    this.cellSelector = (this.grid instanceof WalledGrid) ? new NewValidWalledCellSelector(this.grid) : new NewValidBlockCellSelector(this.grid);


    this.init = function(acc) {

        this.deadEnds = acc.deadEnds.slice(0);
        this.deadEndsToKeep = Math.ceil(this.deadEnds.length * (this.deadendPercentage / 100));

        this.position = this.pickDeadEnd();
        if (this.position) {
            acc.currentPoint = this.position;
            // TODO Reset once done
            acc.reversing = true;
        }

        return (this.position != null);
    };

    this.step = function(acc) {

        var oldPosition = this.position;

        this.position = this.cellSelector.findValidPosition(this.position);
        if (this.position) {
            this.fillCell(oldPosition);
        } else {
            this.position = this.pickDeadEnd();
            if (this.position) {
                console.log("Jumping to (" + this.position.x + "," + this.position.y + ")");
            } else {
                // Terminal case: original cell
                this.fillCell(oldPosition);
            }
        }

        acc.currentPoint = this.position;
        return (this.position != null);
    };

    this.pickDeadEnd = function() {

        if (this.deadEnds.length == 0 || this.deadEnds.length == this.deadEndsToKeep) {
            console.log("No remaining dead ends...");
            return null;
        }

        var idx = Math.floor(Math.random() * this.deadEnds.length);
        var deadEnd = this.deadEnds.splice(idx, 1)[0];
        return deadEnd;
    };

    // TODO Replace with direct Grid call
    this.fillCell = function(position) {
        // TODO Need to fill our open wall AND our neighbours open wall
        console.log("Filling (" + position.x + "," + position.y + ")");

        this.grid.fillCell(position);

    };
};
