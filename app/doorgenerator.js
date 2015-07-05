"use strict";

var Util = require("./util.js");
var Point = require("./point.js");

var DoorGenerator = function DoorGenerator(grid) {
    this.grid = grid;
};
DoorGenerator.prototype.init = function(acc) {
    this.roomIdx = 0;
    return true;
};
DoorGenerator.prototype.step = function(acc) {

    var room = acc.rooms[this.roomIdx];
    console.log("Creating door for room #" + this.roomIdx + ": " + room);

    var x2 = room.location.x + room.width - 1;
    var y2 = room.location.y + room.height - 1;

    var possibleDoors = [];

    // TODO Guard against sides on the edge
    // Top
    var x, y, cell;
    for (x = room.location.x; x <= x2; x++) {
        cell = this.grid.getCell(new Point(x, room.location.y - 2));
        if (cell && cell.clear) {
            possibleDoors.push(new Point(x, room.location.y - 1));
        }
    }
    // Bottom
    for (x = room.location.x; x <= x2; x++) {
        cell = this.grid.getCell(new Point(x, y2 + 2));
        if (cell && cell.clear) {
            possibleDoors.push(new Point(x, y2 + 1));
        }
    }
    // Left
    for (y = room.location.y; y <= y2; y++) {
        cell = this.grid.getCell(new Point(room.location.x - 2, y));
        if (cell && cell.clear) {
            possibleDoors.push(new Point(room.location.x - 1, y));
        }
    }
    // Right
    for (y = room.location.y; y <= y2; y++) {
        cell = this.grid.getCell(new Point(x2 + 2, y));
        if (cell && cell.clear) {
            possibleDoors.push(new Point(x2 + 1, y));
        }
    }

    console.log("Possible doors " + Util.toString(possibleDoors));

    // Sanity check
    if (possibleDoors.length > 0) {
        var door = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
        console.log("Creating door at " + door);
        this.grid.clearCell(door);
    }

    this.roomIdx++;
    return this.roomIdx < acc.rooms.length;
};

module.exports = DoorGenerator;
