angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {

        var Point = function Point(x, y) {
            this.x = x;
            this.y = y;
        };

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

            this.setActivePosition = function(x, y, state) {
                this.x = x;
                this.y = y;
                // TODO Use acc.reversing
                this.state = state;
            }
        };

        var MazeBuilder = function MazeBuilder(grid) {

            this.grid = grid;

            this.init = function(acc) {

                acc.reversing = false;
                acc.history = [];
                acc.deadEnds = [];

                // TODO does this mean we're skipping an animation frame?
                this.x = Math.floor(Math.random() * this.grid.width);
                this.y = Math.floor(Math.random() * this.grid.height);
                this.grid.cells[this.x][this.y].visited = true;

                return true;
            };

            this.step = function(acc) {

                var newPosition = this.findValidPosition();
                if (newPosition) {
                    this.moveForwardTo(acc, newPosition[0], newPosition[1], newPosition[2]);
                } else if (!this.backUp(acc)) {
                    console.log("All moves exhausted!");
                    acc.reversing = false;
                    return false;
                }

                this.grid.setActivePosition(this.x, this.y, acc.reversing);
                return true;
            };

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
                    if (newX < 0 || newX >= this.grid.width || newY < 0 || newY >= this.grid.height) {
                        console.log("Cannot move - off grid");
                    } else if (this.grid.cells[newX][newY].visited) {
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

            this.moveForwardTo = function(acc, newX, newY, direction) {
                acc.reversing = false;

                this.grid.cells[this.x][this.y].walls[direction] = false;
                acc.history.push([this.x, this.y]);

                this.x = newX;
                this.y = newY;
                this.grid.cells[this.x][this.y].walls[this.convertDirection(direction)] = false;
                this.grid.cells[this.x][this.y].visited = true;
                console.log("Moved to (" + this.x + "," + this.y + ")");
            };

            this.convertDirection = function(direction) {
                return (direction + 2) % 4;
            };

            this.backUp = function(acc) {
                if (acc.history.length == 0) {
                    return false;
                }

                if (acc.reversing == false) {
                    acc.deadEnds.push(new Point(this.x, this.y));
                }
                acc.reversing = true;
                var last = acc.history.pop();
                console.log("Returning to (" + last[0] + "," + last[1] + ")...");
                this.x = last[0];
                this.y = last[1];

                return true;
            };
        };

        var DeadEndFiller = function DeadEndFiller(grid, deadendPercentage) {

            this.grid = grid;
            this.deadendPercentage = deadendPercentage;

            this.init = function(acc) {
                this.deadEnds = acc.deadEnds.slice(0);

                this.deadEndsToKeep = Math.ceil(this.deadEnds.length * (this.deadendPercentage / 100));

                this.position = this.pickDeadEnd();

                return (this.position != null);
            };

            this.step = function(acc) {

                var oldPosition = this.position;

                this.position = this.findValidPosition();

                if (this.position) {
                    this.fillCell(oldPosition);
                } else {
                    this.position = this.pickDeadEnd();
                    if (this.position) {
                        console.log("Jumping to (" + this.position.x + "," + this.position.y + ")");
                    }
                }

                if (this.position) {
                    this.grid.setActivePosition(this.position.x, this.position.y, true);
                }

                return (this.position != null);
            };

            this.pickDeadEnd = function() {

                if (this.deadEnds.length == 0 | this.deadEnds.length == this.deadEndsToKeep) {
                    console.log("No remaining dead ends...");
                    return null;
                }

                var idx = Math.floor(Math.random() * this.deadEnds.length);
                var deadEnd = this.deadEnds.splice(idx, 1)[0];
                return deadEnd;
            };

            this.findValidPosition = function() {

                console.log("Finding valid position...");

                var direction = this.findSingleExit(this.grid.cells[this.position.x][this.position.y].walls);

                if (direction != -1) {
                    var newX = this.position.x;
                    var newY = this.position.y;

                    if (direction == 0) {
                        newY--;
                    } else if (direction == 1) {
                        newX++;
                    } else if (direction == 2) {
                        newY++;
                    } else { // (direction == 3)
                        newX--;
                    }

                    var newPosition = new Point(newX, newY);

                    console.log("Moving to (" + newPosition.x + "," + newPosition.y + ")");

                    return newPosition;
                } else {
                    console.log("No valid positions!");
                    return null;
                }
            };

            this.findSingleExit = function(walls) {

                var lastExit = -1;
                for (var direction = 0; direction < 4; direction++) {
                    if (!walls[direction]) {
                        if (lastExit == -1) {
                            lastExit = direction;
                        } else {
                            console.log("Multiple exits!");
                            return -1;
                        }
                    }
                }

                if (lastExit == -1) {
                    console.log("No exits!");
                    return -1;
                }

                return lastExit;
            };

            this.fillCell = function(position) {
                // TODO Need to fill our open wall AND our neighbours open wall
                console.log("Filling (" + position.x + "," + position.y + ")");

                var walls = grid.cells[position.x][position.y].walls;

                if (!walls[0]) {
                    this.grid.cells[position.x][position.y - 1].walls[this.convertDirection(0)] = true;
                }
                if (!walls[1]) {
                    this.grid.cells[position.x + 1][position.y].walls[this.convertDirection(1)] = true;
                }
                if (!walls[2]) {
                    this.grid.cells[position.x][position.y + 1].walls[this.convertDirection(2)] = true;
                }
                if (!walls[3]) {
                    this.grid.cells[position.x - 1][position.y].walls[this.convertDirection(3)] = true;
                }

                this.grid.cells[position.x][position.y].reset();
            };

            this.convertDirection = function(direction) {
                return (direction + 2) % 4;
            };
        };

        var MapGenerator = function MapGenerator(builders) {

            this.acc = {};

            var allBuilders = builders.slice(0);
            var currentBuilder = allBuilders.shift();

            // TODO Handle false from this
            currentBuilder.init(this.acc);

            this.step = function() {

               if (currentBuilder.step(this.acc)) {
                   return true;
               }

               if (allBuilders.length == 0) {
                   return false;
               }

               currentBuilder = allBuilders.shift();

               return currentBuilder.init(this.acc);
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

                    if (this.grid.state) {
                        ctx.fillStyle = '#FF0000';
                    } else {
                        ctx.fillStyle = '#00FF00';
                    }

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

        $scope.params = {width: 5, height: 5, size: 50, deadEnds: 100, speed : 50};

        $scope.gridCanvas = new GridCanvas(document.getElementById("map"));

        var stop;
        $scope.startGeneration = function() {
            // Don't start if we are already generating
            if (angular.isDefined(stop)) {
                return;
            }

            $scope.grid = new Grid($scope.params.width, $scope.params.height);

            $scope.mapGenerator = new MapGenerator([ new MazeBuilder($scope.grid),
                new DeadEndFiller($scope.grid, parseInt($scope.params.deadEnds)) ]);

            $scope.gridCanvas.setCellSize($scope.params.size);
            $scope.gridCanvas.setGrid($scope.grid);
            $scope.gridCanvas.activate();

            stop = $interval(function() {
                var stepsRemain = $scope.mapGenerator.step();

                if (!stepsRemain) {
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