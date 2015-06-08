var ROOM = ROOM || {};

ROOM.Placer = function(grid, roomLimit, maxRoomDimension) {
    this.grid = grid;
    this.limit = roomLimit;
    this.maxRoomSize = maxRoomDimension;
    this.count = 0;
};
ROOM.Placer.prototype.init = function(acc) {
    return true;
};
ROOM.Placer.prototype.step = function(acc) {

    var x = Math.floor(Math.random() * this.grid.width);
    var y = Math.floor(Math.random() * this.grid.height);
    var location = new GRID.Point(x, y);

    console.log('Placing room at ' + location);
    this.grid.clearCell(location);
    this.grid.clearCell(new GRID.Point(location.x + 1, location.y));
    this.grid.clearCell(new GRID.Point(location.x, location.y + 1));
    this.grid.clearCell(new GRID.Point(location.x + 1, location.y + 1));

    return (++this.count < this.limit);
};
ROOM.Placer.prototype.step = function(acc) {

    // Rooms cannot be flush with,the grid edge
    var x = Math.floor(Math.random() * (this.grid.width - 1)) + 1;
    var y = Math.floor(Math.random() * (this.grid.height - 1)) + 1;
    var location = new GRID.Point(x, y);

    // Minimum room size is 2x2
    var width = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;
    var height = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;

    console.log('Placing ' + width + 'x' + height +' room at ' + location);

    // Rooms cannot be over, or flush with,the grid edge
    if (location.x + width >= this.grid.width) {
        console.log("Cannot place room: too wide");
        return true;
    }
    if (location.y + height >= this.grid.height) {
        console.log("Cannot place room: too high");
        return true;
    }

    // TODO Support flag to prevent room overlap
    this.grid.clearCells(new GRID.Point(location.x, location.y), width, height);

    return (++this.count < this.limit);
};