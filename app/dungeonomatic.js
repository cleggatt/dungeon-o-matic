var CaveGenerator = require("./cavegenerator.js");
var CompositeGenerator = require("./compositegenerator.js");
var DoorGenerator = require("./doorgenerator.js");
var FillGenerator = require("./fillgenerator.js");
var MazeGenerator = require("./mazegenerator.js");
var RoomGenerator = require("./roomgenerator.js");

var BlockGrid = require("./blockgrid.js");
var WalledGrid = require("./walledgrid.js");

var createMaze = function(grid, params) {
    var generators = [
        new MazeGenerator(grid),
        new FillGenerator(grid, parseInt(params.deadEnds))
    ];
    return new CompositeGenerator(generators);
};

var createDungeon = function(grid, params) {
    var generators = [
        new RoomGenerator(grid, params.roomLimit, params.maxRoomDimension),
        new MazeGenerator(grid),
        new DoorGenerator(grid),
        new FillGenerator(grid, params.deadEnds)
    ];
    return new CompositeGenerator(generators);
};

var createCave = function(grid, params) {
    var generators = [
        new CaveGenerator(grid, params.iterations, params.birthThreshold, params.deathThreshold)
        // TODO Add a filler to flood fill to work out which is the main cavern
    ];
    return new CompositeGenerator(generators);
};

var DungeonOMatic = function DungeonOMatic(params) {

    if (params.type == 'Dungeon') {
        if (params.walls) {
            this.grid = new WalledGrid(params.width, params.height);
            this.generator = createMaze(this.grid, params);
        } else {
            this.grid = new BlockGrid(params.width, params.height);
            this.generator = createDungeon(this.grid, params)
        }
    } else {
        this.grid = new BlockGrid(params.width, params.height);
        this.generator = createCave(this.grid, params)
    }
};

module.exports = DungeonOMatic;