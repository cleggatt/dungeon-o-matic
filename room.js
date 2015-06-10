var ROOM = ROOM || {};

ROOM.Placer = function(grid, roomLimit, maxRoomDimension) {
    this.grid = grid;
    this.limit = roomLimit;
    // TODO Cannot be so big that we can't place 'count' rooms of average size on the grid
    this.maxRoomSize = maxRoomDimension;
    // TODO Parametetise failure ratio
    this.failureRatio = 100;
    this.count = 0;
    this.failures = 0;
};
ROOM.Placer.prototype.init = function(acc) {
    acc.rooms = [];
    return true;
};
ROOM.Placer.prototype.step = function(acc) {

    // Rooms cannot be flush with,the grid edge
    var x = Math.floor(Math.random() * (this.grid.width - 1)) + 1;
    var y =Math.floor(Math.random() * (this.grid.height - 1)) + 1;
    var location = new GRID.Point(x, y);

    // Minimum room size is 2x2
    var width = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;
    var height = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;

    console.log('Placing ' + width + 'x' + height + ' room at ' + location);

    // Rooms cannot be over, or flush with,the grid edge
    if (location.x + width >= this.grid.width) {
        console.log("Cannot place room: too wide");
        return true;
    }
    if (location.y + height >= this.grid.height) {
        console.log("Cannot place room: too high");
        return true;
    }

    var room = new GRID.Rect(location, width, height);
    console.log("Trying to place room " + room);

    // We give up after 100 attempts so we don't spend to long here
    for (var attempts = 0; attempts < 100; attempts++) {
        if (this.placeRoom(acc)) {
            break;
        }
        this.failures++;
    }

    console.log("Placed " + this.count + "/" + this.limit + ", failed " + this.failures + "/" + (this.count * this.failureRatio))

    return ((this.count < this.limit) && (this.failures <= (this.count * this.failureRatio)));
};

ROOM.Placer.prototype.placeRoom = function(acc) {

    // Rooms cannot be flush with,the grid edge
    var x = Math.floor(Math.random() * (this.grid.width - 1)) + 1;
    var y = Math.floor(Math.random() * (this.grid.height - 1)) + 1;
    var location = new GRID.Point(x, y);

    // Minimum room size is 2x2
    var width = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;
    var height = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;

    console.log('Attempting to place ' + width + 'x' + height + ' room at ' + location);

    // Rooms cannot be over, or flush with,the grid edge
    if (location.x + width >= this.grid.width) {
        console.log("Cannot place room: too wide");
        return true;
    }
    if (location.y + height >= this.grid.height) {
        console.log("Cannot place room: too high");
        return true;
    }

    var room = new GRID.Rect(location, width, height);
    for (var idx = 0; idx < acc.rooms.length; idx++) {
        var existingRoom = acc.rooms[idx];
        // TODO Allow a certain % of overlap to permit odd room shapes
        if (existingRoom.intersection(room, 1, 1)) {
            console.log("Failed to place room due to overlap with " + existingRoom + "!");
            this.failures++;
            return false;
        }
    }

    this.grid.clearCells(location, width, height);
    this.count++;
    acc.rooms.push(room);

    return true;
};