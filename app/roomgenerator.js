var Point = require("./point.js");
var Rect = require("./rect.js");
var Util = require("./util.js");

var RoomGenerator = function RoomGenerator(grid, roomLimit, maxRoomDimension) {
    this.grid = grid;
    this.limit = roomLimit;
    // TODO Cannot be so big that we can't place 'count' rooms of average size on the grid
    this.maxRoomSize = maxRoomDimension;
    // TODO Parametetise failure ratio
    this.failureRatio = 100;
    this.count = 0;
    this.failures = 0;
};
RoomGenerator.prototype.init = function(acc) {

    acc.rooms = [];

    this.potentialRooms = [];
    for (var x = 0; x < this.limit; x++) {
        // Minimum room size is 2x2
        var width = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;
        var height = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;

        var room = new Rect(undefined, width, height);
        this.potentialRooms.push(room);
    }

    this.potentialRooms.sort(function compare(a, b) {
        return b.area - a.area;
    });

    console.log("Potentials rooms: " + Util.toString(this.potentialRooms));

    return true;
};
RoomGenerator.prototype.step = function(acc) {

    var room = this.potentialRooms.shift();
    console.log("Trying to place room " + room);
    // TODO The number of attempts should increase with the delay in animation, in which case we need to remember room
    // We give up after 500 attempts so we don't spend to long here
    for (var attempts = 0; attempts < 500; attempts++) {
        if (this.placeRoom(room, acc)) {
            break;
        }
        this.failures++;
    }

    console.log("Placed " + this.count + "/" + this.limit + ", failed " + this.failures + "/" + (this.count * this.failureRatio))

    return ((this.potentialRooms.length > 0) && (this.failures <= (this.count * this.failureRatio)));
};
RoomGenerator.prototype.placeRoom = function(room, acc) {

    // Rooms cannot be flush with,the grid edge
    var x = Math.floor(Math.random() * (this.grid.width - 1)) + 1;
    var y = Math.floor(Math.random() * (this.grid.height - 1)) + 1;
    var location = new Point(x, y);

    console.log('Attempting to place ' + room + ' at ' + location);

    // Rooms cannot be over, or flush with,the grid edge
    if (location.x + room.width >= this.grid.width) {
        console.log("Cannot place room: too wide");
        return false;
    }
    if (location.y + room.height >= this.grid.height) {
        console.log("Cannot place room: too high");
        return false;
    }

    // TODO Resetting the location is a bit dodgy
    room.location = location;
    for (var idx = 0; idx < acc.rooms.length; idx++) {
        var existingRoom = acc.rooms[idx];
        // TODO Allow a certain % of overlap to permit odd room shapes
        if (existingRoom.intersection(room, 1, 1)) {
            console.log("Failed to place room due to overlap with " + existingRoom + "!");
            return false;
        }
    }

    this.grid.clearCells(location, room.width, room.height);
    this.count++;
    acc.rooms.push(room);

    return true;
};

module.exports = RoomGenerator;