var CAVE = CAVE || {};

CAVE.Generator = function(grid) {
    // TODO Must be a BlockGrid
    this.grid = grid;
    this.iterations = 0;
};
CAVE.Generator.prototype.init = function(acc) {

    // TODO Move clearing of these into ngmoduleor generator?
    acc.reversing = false;
    acc.history = [];
    acc.deadEnds = [];

    for (var x = 0; x < this.grid.cells.length; x++) {
        for (var y = 0; y < this.grid.cells[x].length; y++) {
            if (Math.random() < 0.45) {
                this.grid.clearCell(new GRID.Point(x, y));
            }
        }
    }

    return true;
};
CAVE.Generator.prototype.step = function(acc) {


    // TODO Parameterise
    var deathLimit = 3;
    var birthLimit = 4;

    var oldGrid = this.grid.clone();

    for (var x = 0; x < this.grid.cells.length; x++) {
        for (var y = 0; y < this.grid.cells[x].length; y++) {

            var p = new GRID.Point(x, y);

            var alive = oldGrid.getCell(p).clear;

            var aliveNeighbours = 0;
            // TODO Create x,y variant
            var allNeighbours = oldGrid.getAllNeighbours(p);
            for (var n = 0; n < allNeighbours.length; n++) {
                var neighbour = allNeighbours[n];
                if (neighbour.clear) {
                    aliveNeighbours++;
                }
            }

            // TODO Add overpopulation limit?
            if (alive) {
                if (aliveNeighbours < deathLimit) {
                    this.grid.fillCell(p);
                }
            } else {
                if (aliveNeighbours > birthLimit) {
                    this.grid.clearCell(p);
                }
            }
        }
    }

    // TODO Parameterise
    return (this.iterations++ < 10);
};