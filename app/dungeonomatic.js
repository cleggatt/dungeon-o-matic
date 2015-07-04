var CaveGenerator = require("./cavegenerator.js");
var CompositeGenerator = require("./compositegenerator.js");
var DoorGenerator = require("./doorgenerator.js");
var FillGenerator = require("./fillgenerator.js");
var MazeGenerator = require("./mazegenerator.js");
var RoomGenerator = require("./roomgenerator.js");

var dungeonOmatic =  {
    createMaze: function(grid, params) {
        // TODO Check for walledGrid
        var generators = [
            new MazeGenerator(grid),
            new FillGenerator(grid, parseInt(params.deadEnds))
        ];
        return new CompositeGenerator(generators);
    },
    createDungeon: function(grid, params) {
        // TODO Check for blockGrid
        var generators = [
            new RoomGenerator(grid, params.roomLimit, params.maxRoomDimension),
            new MazeGenerator(grid),
            new DoorGenerator(grid),
            new FillGenerator(grid, params.deadEnds)
        ];
        return new CompositeGenerator(generators);
    },
    createCave:function(grid, params) {
        // TODO Check for blockGrid
        var generators = [
            new CaveGenerator(grid, params.iterations,params.birthThreshold, params.deathThreshold),
            // TODO Add a filler to flood fill to work out which is the main cavern
        ];
        return new CompositeGenerator(generators);
    }
};

module.exports = dungeonOmatic;