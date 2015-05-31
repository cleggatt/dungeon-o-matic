angular.module('generateApp', [])
    .factory('GridService', function() {

        console.log("factory: GridService");

        var Cell = function Cell() {
            this.walls = [0, 0 , 0, 0];
            this.visited = false;
            this.reset = function() {
                this.walls[0] = 0;
                this.walls[1] = 0;
                this.walls[2] = 0;
                this.walls[3] = 0;
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

            this.reset = function() {
                console.log("Grid.reset()");
                this.x = Math.floor(Math.random() * width);
                this.y = Math.floor(Math.random() * height);

                for (i = 0; i < this.cells.length; i++) {
                    for (j = 0; j < this.cells[i].length; j++) {
                        this.cells[i][j].reset();
                    }
                }

                this.cells[this.x][this.y].visited = true;
                this.history = [];
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
                    if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) {
                        console.log("Cannot move - off grid");
                    } else if (this.cells[newX][newY].visited) {
                        console.log("Cannot move - visited");
                    } else {
                        return [newX, newY];
                    }

                    count++;
                    direction = (direction + 1) % 4;
                }

                console.log("Cannot find a valid move!");
                return undefined;
            }

            this.step = function() {

                var newPosition = this.findValidPosition();

                if (newPosition) {
                    this.history.push([this.x, this.y]);

                    this.x = newPosition[0];
                    this.y = newPosition[1];
                    this.cells[this.x][this.y].visited = true;
                    console.log("Moved to (" + newPosition[0] + "," + newPosition[1] + ")");
                } else if (this.history.length == 0) {
                    console.log("All moves exhausted!");
                } else {
                    var last = this.history.pop();
                    console.log("Returning to (" + last[0] + "," + last[1] + ")...");
                    this.x = last[0];
                    this.y = last[1]
                }
            };
        };

        return new Grid(10, 10);
    })
    .controller('GeneratorController', ['$scope', 'GridService', function($scope, GridService) {
        var generator = this;

        var GridCanvas = function GridCanvas(grid, canvas) {
            this.grid = grid;
            this.canvas = canvas;
            this.render = function() {

                console.log("GridCanvas.render()");

                if (!this.canvas.getContext) {
                    // TODO ERROR
                    return;
                }

                var ctx = this.canvas.getContext("2d");
                var x, y;

                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                ctx.fillStyle = '#8ED6FF';
                for (x = 0; x < this.grid.cells.length; x++) {
                    for (y = 0; y < this.grid.cells[x].length; y++) {
                        if (this.grid.cells[x][y].visited) {
                            ctx.fillRect(x * 50, y * 50, 50, 50);
                        }
                    }
                }

                ctx.fillStyle = '#FF0000';
                ctx.fillRect(this.grid.x * 50, this.grid.y * 50, 50, 50);

                for (x = 0; x < this.grid.cells.length; x++) {
                    for (y = 0; y < this.grid.cells[x].length; y++) {
                        ctx.rect(x * 50, y * 50, 50, 50);
                    }
                }
                ctx.stroke();
            }
        };

        this.gridCanvas = new GridCanvas(GridService, document.getElementById("map"));

        generator.render = function() {
            this.gridCanvas.render();
        }

        generator.reset = function() {
            GridService.reset();
            this.gridCanvas.render();
        };

        generator.generate = function() {
            GridService.step();
            this.gridCanvas.render();
        };

        $scope.grid = GridService;
    }]);
