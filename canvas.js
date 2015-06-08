var CANVAS = CANVAS || {};

CANVAS.GridCanvas = function(canvas, acc) {

    this.canvas = canvas;
    this.acc = acc;
    this.cellSize = 50;
};
CANVAS.GridCanvas.prototype.setCellSize = function(cellSize) {
    this.cellSize = cellSize;
    if (this.grid) {
        this.canvas.width = this.grid.width * this.cellSize;
        this.canvas.height = this.grid.height * this.cellSize;
    }
};
CANVAS.GridCanvas.prototype.setGrid = function(grid) {
    this.grid = grid;
    this.canvas.width = this.grid.width * this.cellSize;
    this.canvas.height = this.grid.height * this.cellSize;

    this.drawWalls = (grid instanceof GRID.WalledGrid);
};
// TODO Rename - Shall we call this "state data"?
CANVAS.GridCanvas.prototype.setAcc = function(acc) {
    this.acc = acc;
};
CANVAS.GridCanvas.prototype.render = function() {
    // TODO Check for grid and acc
    console.log("GridCanvas.render()");

    if (!this.canvas.getContext) {
        // TODO Handle this error
        return;
    }

    var ctx = this.canvas.getContext("2d");
    var x, y;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // TODO Draw border

    // Draw filled cells
    ctx.fillStyle = '#000000';
    for (x = 0; x < this.grid.cells.length; x++) {
        for (y = 0; y < this.grid.cells[x].length; y++) {
            if (!this.grid.cells[x][y].clear) {
                ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    // Draw any history
    if (this.acc.history) {
        ctx.fillStyle = '#0000FF';
        for (x = 0; x < this.acc.history.length; x++) {
            var point = this.acc.history[x];
            ctx.fillRect(point.x * this.cellSize, point.y * this.cellSize, this.cellSize, this.cellSize);
        }
    }

    // Draw any active cell
    if (this.acc.currentPoint) {
        if (this.acc.reversing) {
            ctx.fillStyle = '#FF0000';
        } else {
            ctx.fillStyle = '#00FF00';
        }
        ctx.fillRect(this.acc.currentPoint.x * this.cellSize, this.acc.currentPoint.y * this.cellSize, this.cellSize, this.cellSize);
    }

    if (this.drawWalls) {
        ctx.beginPath();
        for (x = 0; x < this.grid.cells.length; x++) {
            for (y = 0; y < this.grid.cells[x].length; y++) {
                this.drawCell(ctx, x * this.cellSize, y * this.cellSize, this.grid.cells[x][y].walls);
            }
        }
        ctx.stroke();
    }
};
CANVAS.GridCanvas.prototype.drawCell = function(ctx, x, y, walls) {
    if (walls[0]) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.cellSize, y);
    }
    if (walls[1]) {
        ctx.moveTo(x + this.cellSize, y);
        ctx.lineTo(x + this.cellSize, y + this.cellSize);
    }
    if (walls[2]) {
        ctx.moveTo(x, y + this.cellSize);
        ctx.lineTo(x + this.cellSize, y + this.cellSize);
    }
    if (walls[3]) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + this.cellSize);
    }
};