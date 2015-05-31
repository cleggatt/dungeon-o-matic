angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {

        var Cell = function Cell() {

            this.walls = [true, true, true, true];
            this.visited = false;
            this.reset = function() {
                this.walls[0] = true;
                this.walls[1] = true;
                this.walls[2] = true;
                this.walls[3] = true;
                this.visited = false;
            };
        };

        var Grid = function Grid(width, height) {

            this.width = width;
            this.height = height;

            this.cells = new Array(width);
            for (i = 0; i < this.cells.length; i++) {
                this.cells[i] = new Array(height);
                for (j = 0; j < this.cells[i].length; j++) {
                    this.cells[i][j] = new Cell();
                }
            }

            this.x = Math.floor(Math.random() * width);
            this.y = Math.floor(Math.random() * height);
            this.cells[this.x][this.y].visited = true;
            this.history = [];

            this.findValidPosition = function() {

                var direction = Math.floor(Math.random() * 4);
                var count = 0;

                while (count < 4) {
                    console.log("Check in direction " + direction + "...");

                    var newX = this.x;
                    var newY = this.y;

                    if (direction == 0) {
                        newY--;
                    } else if (direction == 1) {
                        newX++;
                    } else if (direction == 2) {
                        newY++;
                    } else { // (direction == 3)
                        newX--;
                    }

                    console.log("Checking (" + newX + "," + newY + ")...");
                    if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) {
                        console.log("Cannot move - off grid");
                    } else if (this.cells[newX][newY].visited) {
                        console.log("Cannot move - visited");
                    } else {
                        return [newX, newY, direction];
                    }

                    count++;
                    direction = (direction + 1) % 4;
                }

                console.log("Cannot find a valid move!");
                return undefined;
            };

            this.step = function() {

                var newPosition = this.findValidPosition();

                if (newPosition) {
                    this.cells[this.x][this.y].walls[newPosition[2]] = false;
                    this.history.push([this.x, this.y]);

                    this.x = newPosition[0];
                    this.y = newPosition[1];
                    this.cells[this.x][this.y].walls[this.convertDirection(newPosition[2])] = false;
                    this.cells[this.x][this.y].visited = true;
                    console.log("Moved to (" + newPosition[0] + "," + newPosition[1] + ")");

                    return true;
                } else if (this.history.length == 0) {
                    console.log("All moves exhausted!");
                    return false;
                } else {
                    var last = this.history.pop();
                    console.log("Returning to (" + last[0] + "," + last[1] + ")...");
                    this.x = last[0];
                    this.y = last[1];
                    return true;
                }
            };

            this.convertDirection = function(direction) {
                return (direction + 2) % 4;
            }
        };

        var GridCanvas = function GridCanvas(canvas) {

            this.canvas = canvas;
            this.active = false;
            this.cellSize = 50;

            this.setCellSize = function(cellSize) {
                this.cellSize = cellSize;
                if (this.grid) {
                    this.canvas.width = this.grid.width * this.cellSize;
                    this.canvas.height = this.grid.height * this.cellSize;
                }
            };

            this.setGrid = function(grid) {
                this.grid = grid;
                this.canvas.width = this.grid.width * this.cellSize;
                this.canvas.height = this.grid.height * this.cellSize;
            };

            this.activate = function() {
                this.active = true;
            };

            this.deactivate = function() {
                this.active = false;
            };

            this.render = function() {
                // TODO Check for grid
                console.log("GridCanvas.render()");

                if (!this.canvas.getContext) {
                    // TODO ERROR
                    return;
                }

                var ctx = this.canvas.getContext("2d");
                var x, y;

                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                if (this.active) {
                    ctx.fillStyle = '#8ED6FF';
                    for (x = 0; x < this.grid.cells.length; x++) {
                        for (y = 0; y < this.grid.cells[x].length; y++) {
                            if (this.grid.cells[x][y].visited) {
                                ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                            }
                        }
                    }

                    ctx.fillStyle = '#FF0000';
                    ctx.fillRect(this.grid.x * this.cellSize, this.grid.y * this.cellSize, this.cellSize, this.cellSize);
                }

                ctx.beginPath();
                for (x = 0; x < this.grid.cells.length; x++) {
                    for (y = 0; y < this.grid.cells[x].length; y++) {
                        this.drawCell(ctx, x * this.cellSize, y * this.cellSize, this.grid.cells[x][y].walls);
                    }
                }
                ctx.stroke();
            };

            this.drawCell = function(ctx, x, y, walls) {
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
        };

        $scope.params = {width: 10, height: 10, size: 50, speed : 50};

        $scope.gridCanvas = new GridCanvas(document.getElementById("map"));

        var stop;
        $scope.startGeneration = function() {
            // Don't start if we are already generating
            if (angular.isDefined(stop)) {
                return;
            }

            $scope.grid = new Grid($scope.params.width, $scope.params.height);

            $scope.gridCanvas.setCellSize($scope.params.size);
            $scope.gridCanvas.setGrid($scope.grid);
            $scope.gridCanvas.activate();

            stop = $interval(function() {
                var movesRemain = $scope.grid.step();

                if (!movesRemain) {
                    $scope.gridCanvas.deactivate();
                    $scope.stopGeneration();
                }

                $scope.gridCanvas.render();
            }, $scope.params.speed);
        };

        $scope.stopGeneration = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
    }]);