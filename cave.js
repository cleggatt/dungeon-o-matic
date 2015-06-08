var CAVE = CAVE || {};

CAVE.Generator = function(grid, iterations, birthThreshold, deathThreshold) {
    // TODO Must be a BlockGrid
    this.grid = grid;
    this.birthThreshold = birthThreshold;
    this.deathThreshold = deathThreshold;
    this.maxIterations = iterations;
    this.iterations = 0;
};
CAVE.Generator.prototype.init = function(acc) {

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
                if (neighbour && neighbour.clear) {
                    aliveNeighbours++;
                }
            }

            // TODO Add overpopulation limit?
            if (alive) {
                if (aliveNeighbours < this.deathThreshold) {
                    this.grid.fillCell(p);
                }
            } else {
                if (aliveNeighbours > this.birthThreshold) {
                    this.grid.clearCell(p);
                }
            }
        }
    }

    return (++this.iterations < this.maxIterations);
};