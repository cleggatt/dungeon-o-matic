// TODO Make private to module
var ValidBlockCellSelector = function ValidBlockCellSelector(grid) {

    this.grid = grid;

    this.findValidCell = function(startingPoint) {

        var neighbourCells = this.grid.getNeighbours(startingPoint);
        var numNeighbours = neighbourCells.length;
        console.log("Checking cells " + neighbourCells + "...");

        var count = 0;
        var idx = Math.floor(Math.random() * numNeighbours);
        while (count < neighbourCells.length) {
            var neighbourCell = neighbourCells[idx];
            console.log("Checking cell " + neighbourCell + "...");
            if (neighbourCell.clear) {
                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");

            } else if (this.isValidNewLocation(startingPoint, neighbourCell)) {
                console.log(neighbourCell.location + " is a valid target cell");
                return neighbourCell;
            } else {
                console.log("Invalid target cell - has clear neighbours");
            }

            count++;
            idx = (idx + 1) % numNeighbours;
        }

        console.log("Cannot find a valid cell!");
        return null;
    };

    this.isValidNewLocation = function(fromPoint, toCell) {
        var neighbours = this.grid.getNeighbours(toCell.location);
        console.log("Checking for clear neighbours: " + neighbours + "...");

        for (var idx = 0; idx < neighbours.length; idx++) {
            var neighbour = neighbours[idx];

            if (neighbour.location.equals(fromPoint)) {
                console.log("Ignoring original cell: " + neighbour);
                continue;
            }

            if (neighbour.clear) {
                console.log("Found non-clear neighbour: " + neighbour);
                return false;
            }
        }

        return true;
    };
};

// TODO Make private to module
var ValidWalledCellSelector = function ValidWalledCellSelector(grid) {

    this.grid = grid;

    this.findValidCell = function(startingPoint) {

        var neighbourCells = this.grid.getNeighbours(startingPoint);
        var numNeighbours = neighbourCells.length;
        console.log("Checking cells " + neighbourCells + "...");

        var count = 0;
        var idx = Math.floor(Math.random() * numNeighbours);
        while (count < neighbourCells.length) {
            var neighbourCell = neighbourCells[idx];
            if (neighbourCell.clear) {
                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");
            } else {
                console.log(neighbourCell.location + " is a valid target cell");
                return neighbourCell;
            }

            count++;
            idx = (idx + 1) % numNeighbours;
        }

        console.log("Cannot find a valid target cell!");
        return null;
    };
};

var MazeBuilder = function MazeBuilder(grid) {

    this.grid = grid;

    this.cellSelector = (this.grid instanceof WalledGrid) ? new ValidWalledCellSelector(this.grid) : new ValidBlockCellSelector(this.grid);

    this.init = function(acc) {

        acc.reversing = false;
        acc.history = [];
        acc.deadEnds = [];

        // TODO does this mean we're skipping an animation frame?
        var x = Math.floor(Math.random() * this.grid.width);
        var y = Math.floor(Math.random() * this.grid.height);
        this.location = new Point(x, y);

        acc.currentPoint = this.location;

        this.grid.clearCell(this.location);

        return true;
    };

    this.step = function(acc) {

        var newCell = this.cellSelector.findValidCell(this.location);
        if (newCell) {
            this.moveForwardTo(acc, newCell);
            console.log("Moved to " + newCell.location);
        } else if (!this.moveBack(acc)) {
            console.log("All moves exhausted!");
            acc.currentPoint = null;
            acc.reversing = false;
            return false;
        }

        acc.currentPoint = this.location;
        return true;
    };

    this.moveForwardTo = function(acc, newCell) {
        acc.reversing = false;

        acc.history.push(this.location);

        this.grid.clearPath(this.location, newCell.location);

        this.location = newCell.location;
    };

    this.convertDirection = function(direction) {
        return (direction + 2) % 4;
    };

    this.moveBack = function(acc) {
        if (acc.history.length == 0) {
            return false;
        }

        if (acc.reversing == false) {
            acc.deadEnds.push(this.location);
        }
        acc.reversing = true;
        var previousLocation = acc.history.pop();
        console.log('Returning to ' + previousLocation);
        this.location = previousLocation;

        return true;
    };
};
