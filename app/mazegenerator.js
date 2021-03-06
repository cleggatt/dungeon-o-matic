"use strict";

var Point = require("./point.js");
var Util = require("./util.js");
var WalledGrid = require("./walledgrid.js");

var ValidBlockCellSelector = function ValidBlockCellSelector(grid) {
    this.grid = grid;
};
ValidBlockCellSelector.prototype.findValidCell = function(startingPoint) {

    var neighbourCells = this.grid.getAdjacentNeighbours(startingPoint);
    var numNeighbours = neighbourCells.length;
    console.log("Checking cells " + Util.toString(neighbourCells) + "...");

    var count = 0;
    var direction = Math.floor(Math.random() * numNeighbours);
    while (count < neighbourCells.length) {
        var neighbourCell = neighbourCells[direction];
        if (neighbourCell != null) {
            console.log("Checking cell " + neighbourCell + " in direction " + direction + "...");
            if (neighbourCell.clear) {
                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");
            } else if (this.isValidNewLocation(neighbourCell, direction)) {
                console.log(neighbourCell.location + " is a valid target cell");
                return neighbourCell;
            } else {
                console.log("Invalid target cell - has clear neighbours");
            }
        }

        count++;
        direction = (direction + 1) % numNeighbours;
    }

    console.log("Cannot find a valid cell!");
    return null;
};
ValidBlockCellSelector.prototype.isValidNewLocation = function(cell, direction) {

    var directionsToCheck;
    if (direction == 1) {
        directionsToCheck = [0, 1, 2, 3, 7];
    } else if (direction == 3) {
        directionsToCheck = [1, 2, 3, 4, 5];
    } else if (direction == 5) {
        directionsToCheck = [3, 4, 5, 6, 7];
    } else { // direction == 7
        directionsToCheck = [0, 1, 5, 6, 7];
    }

    var neighbours = this.grid.getAllNeighbours(cell.location);
    for (var idx = 0; idx < directionsToCheck.length; idx++) {

        var directionToCheck = directionsToCheck[idx];
        var neighbour = neighbours[directionToCheck];

        console.log("Checking neighbour in direction " + directionToCheck + ": " + neighbour);
        if (neighbour != null && neighbour.clear) {
            console.log("Found non-clear neighbour: " + neighbour);
            return false;
        }
    }

    return true;
};

var ValidWalledCellSelector = function ValidWalledCellSelector(grid) {
    this.grid = grid;
};
ValidWalledCellSelector.prototype.findValidCell = function(startingPoint) {

    var neighbourCells = this.grid.getAdjacentNeighbours(startingPoint);
    var numNeighbours = neighbourCells.length;
    console.log("Checking cells " + Util.toString(neighbourCells) + "...");

    var count = 0;
    var idx = Math.floor(Math.random() * numNeighbours);
    while (count < neighbourCells.length) {
        var neighbourCell = neighbourCells[idx];
        if (neighbourCell != null) {
            if (neighbourCell.clear) {
                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");
            } else {
                console.log(neighbourCell.location + " is a valid target cell");
                return neighbourCell;
            }
        }

        count++;
        idx = (idx + 1) % numNeighbours;
    }

    console.log("Cannot find a valid target cell!");
    return null;
};

var MazeGenerator = function MazeGenerator(grid) {
    this.grid = grid;
    this.cellSelector = (this.grid instanceof WalledGrid) ? new ValidWalledCellSelector(this.grid) : new ValidBlockCellSelector(this.grid);
};
MazeGenerator.prototype.init = function(acc) {

    acc.reversing = false;
    acc.history = [];
    acc.deadEnds = [];

    // TODO Make sure the cell is a valid cell for blocks e.g not empty and clear on all sides
    // Alternatively, start in a valid door position
    var x = Math.floor(Math.random() * this.grid.width);
    var y = Math.floor(Math.random() * this.grid.height);
    this.location = new Point(x, y);

    acc.currentPoint = this.location;

    this.grid.clearCell(this.location);

    return true;
};
MazeGenerator.prototype.step = function(acc) {

    console.log("Current location is " + this.location);

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
MazeGenerator.prototype.moveForwardTo = function(acc, newCell) {
    acc.reversing = false;

    acc.history.push(this.location);

    this.grid.clearPath(this.location, newCell.location);

    this.location = newCell.location;
};
MazeGenerator.prototype.moveBack = function(acc) {
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

module.exports = MazeGenerator;