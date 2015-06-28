/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var BlockGrid = __webpack_require__(1);
	var CaveGenerator = __webpack_require__(3);
	var CompositeGenerator = __webpack_require__(4);
	var DoorGenerator = __webpack_require__(5);
	var FillGenerator = __webpack_require__(7);
	var GridCanvas = __webpack_require__(9);
	var MazeGenerator = __webpack_require__(10);
	var RoomGenerator = __webpack_require__(11);
	var WalledGrid = __webpack_require__(8);

	angular.module('generateApp', [])
	    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {
	        $scope.params = {
	            type: 'Dungeon',
	            walls: true,
	            width: 50,
	            height: 50,
	            size: 15,
	            roomLimit : 15,
	            maxRoomDimension: 10,
	            deadEnds: 50,
	            speed : 50,
	            birthThreshold: 3,
	            deathThreshold: 4,
	            iterations : 5};

	        $scope.gridCanvas = new GridCanvas(document.getElementById("map"));

	        $scope.generating = false;
	        $scope.paused = false;

	        var animator = function () {
	            var stepsRemain = $scope.mapGenerator.step();
	            if (!stepsRemain) {
	                $scope.stopGeneration();
	            }
	            $scope.gridCanvas.render();
	        };

	        var animatorPromise;
	        var startAnimator = function () {
	            $scope.paused = false;
	            animatorPromise = $interval(animator, $scope.params.speed);
	        };
	        var stopAnimator = function () {
	            $scope.paused = true;
	            if (angular.isDefined(animatorPromise)) {
	                $interval.cancel(animatorPromise);
	                animatorPromise = undefined;
	            }
	        };

	        $scope.startGeneration = function() {
	            if ($scope.generating) {
	                return;
	            }
	            $scope.generating = true;

	            var generators;

	            if ($scope.params.type == 'Dungeon') {

	                if ($scope.params.walls) {
	                    $scope.grid = new WalledGrid($scope.params.width, $scope.params.height);
	                    generators = [
	                        new MazeGenerator($scope.grid),
	                        new FillGenerator($scope.grid, parseInt($scope.params.deadEnds))
	                    ];
	                } else {
	                    $scope.grid = new BlockGrid($scope.params.width, $scope.params.height);
	                    generators = [
	                        new RoomGenerator($scope.grid, $scope.params.roomLimit, $scope.params.maxRoomDimension),
	                        new MazeGenerator($scope.grid),
	                        new DoorGenerator($scope.grid),
	                        new FillGenerator($scope.grid, parseInt($scope.params.deadEnds))
	                    ];
	                }
	            } else {
	                $scope.grid = new BlockGrid($scope.params.width, $scope.params.height);
	                generators = [
	                    new CaveGenerator($scope.grid, $scope.params.iterations, $scope.params.birthThreshold, $scope.params.deathThreshold),
	                    // TODO Add a filler to flood fill to work out which is the main cavern
	                ];
	            }

	            $scope.mapGenerator = new CompositeGenerator(generators);

	            $scope.gridCanvas.setCellSize($scope.params.size);
	            $scope.gridCanvas.setGrid($scope.grid);
	            $scope.gridCanvas.setAcc($scope.mapGenerator.acc);

	            startAnimator();
	        };

	        $scope.pauseGeneration = function() {
	            if ($scope.paused) {
	                startAnimator();
	            } else {
	                stopAnimator ();
	            }
	        };

	        $scope.stepGeneration = function() {
	            animator();
	        };

	        // This is an artificial state - it's just paused with the flags set so as no to allow un-pausing
	        $scope.stopGeneration = function() {
	            stopAnimator();
	            $scope.generating = false;
	            $scope.paused = false;
	        };

	        $scope.$on('$destroy', function() {
	            if (angular.isDefined(animatorPromise)) {
	                $interval.cancel(animatorPromise);
	            }
	        });

	        var getPosition = function(event) {
	            var x = event.offsetX;
	            var y = event.offsetY;

	            var point = $scope.gridCanvas.convertPoint(x, y);
	            var cell = $scope.grid.getCell(point);
	            if (cell) {
	                console.log("Toggling cell " + cell);
	                if (cell.clear) {
	                    $scope.grid.fillCell(point);
	                } else {
	                    $scope.grid.clearCell(point);
	                }
	                $scope.gridCanvas.render();
	            }
	        };
	        $scope.gridCanvas.canvas.addEventListener("mousedown", getPosition, false);
	    }]);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);

	var BlockCell = function BlockCell(point) {
	    this.location = point;
	    this.clear = false;
	};
	BlockCell.prototype.toString = function() {
	    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
	};

	var BlockGrid = function BlockGrid(width, height) {
	    this.width = width;
	    this.height = height;

	    this.cells = new Array(width);
	    for (var x = 0; x < this.cells.length; x++) {
	        this.cells[x] = new Array(height);
	        for (var y = 0; y < this.cells[x].length; y++) {
	            this.cells[x][y] = new BlockCell(new Point(x, y));
	        }
	    }
	};
	BlockGrid.prototype.clone = function() {
	    // TODO This could be more efficient and just initialise the cells on creation
	    var clone = new BlockGrid(this.width, this.height);
	    for (var x = 0; x < this.cells.length; x++) {
	        for (var y = 0; y < this.cells[x].length; y++) {
	            clone.cells[x][y].clear = this.cells[x][y].clear;
	        }
	    }
	    return clone;
	};
	BlockGrid.prototype.getCell = function(point) {
	    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
	        return null;
	    }

	    return this.cells[point.x][point.y];
	};
	BlockGrid.prototype.getAdjacentNeighbours = function(point) {
	    var neighbours = [ null, null, null, null, null, null, null, null];

	    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
	    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));
	    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
	    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

	    return neighbours;
	};
	BlockGrid.prototype.getAllNeighbours = function(point) {

	    var neighbours = [ null, null, null, null, null, null, null, null];

	    neighbours[0] = this.getCell(new Point(point.x - 1, point.y - 1));
	    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
	    neighbours[2] = this.getCell(new Point(point.x + 1, point.y - 1));

	    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));

	    neighbours[4] = this.getCell(new Point(point.x + 1, point.y + 1));
	    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
	    neighbours[6] = this.getCell(new Point(point.x - 1, point.y + 1));

	    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

	    return neighbours;
	};
	BlockGrid.prototype.clearCell = function(location) {
	    this.cells[location.x][location.y].clear = true;
	};
	// TODO Change to take Rect
	BlockGrid.prototype.clearCells = function(location, width, height) {
	    for (var i = 0; i < width; i++) {
	        for (var j = 0; j < height; j++) {
	            this.cells[location.x + i][location.y + j].clear = true;
	        }
	    }
	};
	BlockGrid.prototype.clearPath = function(from, to) {
	    // TODO Check that cells are adjacent
	    var fromCell = this.cells[from.x][from.y];
	    var toCell = this.cells[to.x][to.y];

	    fromCell.clear = true;
	    toCell.clear = true;
	};
	BlockGrid.prototype.fillCell = function(point) {
	    var cell = this.cells[point.x][point.y];
	    cell.clear = false;
	};

	module.exports = BlockGrid;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var Point = function Point(x, y) {
	    this.x = x;
	    this.y = y;
	};
	Point.prototype.equals = function(otherPoint) {
	    return this.x == otherPoint.x && this.y == otherPoint.y;
	};
	Point.prototype.toString = function() {
	    return '(' + this.x + ', ' + this.y + ')';
	};

	module.exports = Point;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);

	var CaveGenerator = function CaveGenerator(grid, iterations, birthThreshold, deathThreshold) {
	    // TODO Must be a BlockGrid
	    this.grid = grid;
	    this.birthThreshold = birthThreshold;
	    this.deathThreshold = deathThreshold;
	    this.maxIterations = iterations;
	    this.iterations = 0;
	};
	CaveGenerator.prototype.init = function(acc) {

	    for (var x = 0; x < this.grid.cells.length; x++) {
	        for (var y = 0; y < this.grid.cells[x].length; y++) {
	            if (Math.random() < 0.45) {
	                this.grid.clearCell(new Point(x, y));
	            }
	        }
	    }

	    return true;
	};
	CaveGenerator.prototype.step = function(acc) {

	    var oldGrid = this.grid.clone();

	    for (var x = 0; x < this.grid.cells.length; x++) {
	        for (var y = 0; y < this.grid.cells[x].length; y++) {

	            var p = new Point(x, y);

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

	module.exports = CaveGenerator;

/***/ },
/* 4 */
/***/ function(module, exports) {

	var CompositeGenerator = function CompositeGenerator(generators) {

	    this.acc = {};

	    this.allGenerators = generators.slice(0);
	    this.currentGenerator = null;
	};
	CompositeGenerator.prototype.step = function() {

	    if (this.currentGenerator == null) {
	        if (this.allGenerators.length == 0) {
	            // To reach here, we must have been created with no generators, or step() was call after it has returned false
	            return false;
	        }

	        this.currentGenerator = this.allGenerators.shift();
	        return this.currentGenerator.init(this.acc);
	    }

	    if (this.currentGenerator.step(this.acc)) {
	        return true;
	    }

	    this.currentGenerator = null;
	    return this.allGenerators.length > 0;
	};

	module.exports = CompositeGenerator;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(6);
	var Point = __webpack_require__(2);

	var DoorGenerator = function DoorGenerator(grid) {
	    this.grid = grid;
	};
	DoorGenerator.prototype.init = function(acc) {
	    this.roomIdx = 0;
	    return true;
	};
	DoorGenerator.prototype.step = function(acc) {

	    var room = acc.rooms[this.roomIdx];
	    console.log("Creating door for room #" + this.roomIdx + ": " + room);

	    var x2 = room.location.x + room.width - 1;
	    var y2 = room.location.y + room.height - 1;

	    var possibleDoors = [];

	    // TODO Guard against sides on the edge
	    // Top
	    var x, y, cell;
	    for (x = room.location.x; x <= x2; x++) {
	        cell = this.grid.getCell(new Point(x, room.location.y - 2));
	        if (cell && cell.clear) {
	            possibleDoors.push(new Point(x, room.location.y - 1));
	        }
	    }
	    // Bottom
	    for (x = room.location.x; x <= x2; x++) {
	        cell = this.grid.getCell(new Point(x, y2 + 2));
	        if (cell && cell.clear) {
	            possibleDoors.push(new Point(x, y2 + 1));
	        }
	    }
	    // Left
	    for (y = room.location.y; y <= y2; y++) {
	        cell = this.grid.getCell(new Point(room.location.x - 2, y));
	        if (cell && cell.clear) {
	            possibleDoors.push(new Point(room.location.x - 1, y));
	        }
	    }
	    // Right
	    for (y = room.location.y; y <= y2; y++) {
	        cell = this.grid.getCell(new Point(x2 + 2, y));
	        if (cell && cell.clear) {
	            possibleDoors.push(new Point(x2 + 1, y));
	        }
	    }

	    console.log("Possible doors " + Util.toString(possibleDoors));

	    // Sanity check
	    if (possibleDoors.length > 0) {
	        var door = possibleDoors[Math.floor(Math.random() * possibleDoors.length)];
	        console.log("Creating door at " + door);
	        this.grid.clearCell(door);
	    }

	    this.roomIdx++;
	    return this.roomIdx < acc.rooms.length;
	};

	module.exports = DoorGenerator;


/***/ },
/* 6 */
/***/ function(module, exports) {

	var toString = function toString(o) {
	    if (o instanceof Array) {
	        var buff = "";
	        for (var idx = 0; idx < o.length; idx++) {
	            var item = o[idx];
	            if (item) {
	                buff += o[idx].toString() + ', ';
	            } else {
	                buff += 'null, ';
	            }
	        }
	        return buff.slice(0, -2);

	    } else {
	        return o.toString()
	    }
	};

	module.exports.toString = toString;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);
	var WalledGrid = __webpack_require__(8);

	var ValidWalledCellSelector = function ValidWalledCellSelector(grid) {
	    this.grid = grid;
	};
	ValidWalledCellSelector.prototype.findValidPosition = function(fromPoint) {

	    console.log('Finding valid position from ' + fromPoint + '...');

	    var direction = this.findSingleExit(this.grid.getCell(fromPoint).walls);
	    if (direction != -1) {
	        var newX = fromPoint.x;
	        var newY = fromPoint.y;

	        // TODO Should we move this into grid or Point, Cell or Grid?
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

	        return newPosition;
	    } else {
	        return null;
	    }
	};
	ValidWalledCellSelector.prototype.findSingleExit = function(walls) {

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

	var ValidBlockCellSelector = function ValidBlockCellSelector(grid) {
	    this.grid = grid;
	};
	ValidBlockCellSelector.prototype.findValidPosition = function(fromPoint) {
	    var neighbours = this.grid.getAdjacentNeighbours(fromPoint);
	    console.log("Finding valid position from: " + neighbours + "...");

	    var lastExit = null;
	    for (var idx = 0; idx < neighbours.length; idx++) {
	        var neighbour = neighbours[idx];
	        if (neighbour && neighbour.clear) {
	            if (lastExit == null) {
	                lastExit = neighbour;
	            } else {
	                console.log("Multiple clear neighbours!");
	                return null;
	            }
	        }
	    }

	    return lastExit ? lastExit.location : null;
	};

	var FillGenerator = function FillGenerator(grid, deadEndPercentage) {
	    this.grid = grid;
	    // TODO Allow percentage to be % of cells vs % of corridors
	    this.deadEndPercentage = deadEndPercentage;

	    this.cellSelector = (this.grid instanceof WalledGrid) ? new ValidWalledCellSelector(this.grid) : new ValidBlockCellSelector(this.grid);
	};
	FillGenerator.prototype.init = function(acc) {

	    this.deadEnds = acc.deadEnds.slice(0);
	    this.deadEndsToKeep = Math.ceil(this.deadEnds.length * (this.deadEndPercentage / 100));

	    this.position = this.pickDeadEnd();
	    if (this.position) {
	        acc.currentPoint = this.position;
	        // TODO Reset once done
	        acc.reversing = true;
	    }

	    return (this.position != null);
	};
	FillGenerator.prototype.step = function(acc) {

	    var oldPosition = this.position;

	    this.position = this.cellSelector.findValidPosition(this.position);
	    if (this.position) {
	        console.log('Moving to ' + this.position);
	        this.fillCell(oldPosition);
	    } else {
	        console.log("No valid positions!");
	        this.position = this.pickDeadEnd();
	        if (this.position) {
	            console.log('Jumping to ' + this.position);
	        }
	    }

	    acc.currentPoint = this.position;
	    return (this.position != null);
	};
	FillGenerator.prototype.pickDeadEnd = function() {

	    console.log("Finding valid dead end while keeping " + this.deadEndsToKeep);

	    if (this.deadEnds.length == 0 || this.deadEnds.length == this.deadEndsToKeep) {
	        console.log("No remaining dead ends...");
	        return null;
	    }

	    var idx = Math.floor(Math.random() * this.deadEnds.length);
	    var deadEnd = this.deadEnds.splice(idx, 1)[0];
	    return deadEnd;
	};
	// TODO Replace with direct Grid call
	FillGenerator.prototype.fillCell = function(position) {
	    console.log("Filling (" + position.x + "," + position.y + ")");
	    this.grid.fillCell(position);
	};

	module.exports = FillGenerator;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);

	var WalledCell = function WalledCell(point) {
	    this.location = point;
	    this.clear = false;
	    this.walls = [true, true, true, true];
	};
	// TODO Should this also set clear=false? If so, add a reset to BlockCell
	WalledCell.prototype.reset = function() {
	    this.walls[0] = true;
	    this.walls[1] = true;
	    this.walls[2] = true;
	    this.walls[3] = true;
	};
	WalledCell.prototype.toString = function() {
	    return this.location + ' [' + (this.clear ? 'clear' : 'full') + ']';
	};

	var WalledGrid = function(width, height) {

	    this.width = width;
	    this.height = height;

	    this.cells = new Array(width);
	    for (var x = 0; x < this.cells.length; x++) {
	        this.cells[x] = new Array(height);
	        for (var y = 0; y < this.cells[x].length; y++) {
	            var point = new Point(x, y);
	            this.cells[x][y] = new WalledCell(point);
	        }
	    }
	};
	WalledGrid.prototype.getCell = function(point) {
	    if (point.x < 0 || point.x >= this.width || point.y < 0 || point.y >= this.height) {
	        return null;
	    }

	    return this.cells[point.x][point.y];
	};
	WalledGrid.prototype.getAdjacentNeighbours = function(point) {
	    var neighbours = [ null, null, null, null, null, null, null, null];

	    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
	    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));
	    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
	    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

	    return neighbours;
	};
	WalledGrid.prototype.getAllNeighbours = function(point) {

	    var neighbours = [ null, null, null, null, null, null, null, null];

	    neighbours[0] = this.getCell(new Point(point.x - 1, point.y - 1));
	    neighbours[1] = this.getCell(new Point(point.x, point.y - 1));
	    neighbours[2] = this.getCell(new Point(point.x + 1, point.y - 1));

	    neighbours[3] = this.getCell(new Point(point.x + 1, point.y));

	    neighbours[4] = this.getCell(new Point(point.x + 1, point.y + 1));
	    neighbours[5] = this.getCell(new Point(point.x, point.y + 1));
	    neighbours[6] = this.getCell(new Point(point.x - 1, point.y + 1));

	    neighbours[7] = this.getCell(new Point(point.x - 1, point.y));

	    return neighbours;
	};
	WalledGrid.prototype.clearCell = function(point) {
	    this.cells[point.x][point.y].clear = true;
	};
	// TODO Pass cell or points?
	WalledGrid.prototype.clearPath = function(from, to) {

	    var fromCell = this.cells[from.x][from.y];
	    var toCell = this.cells[to.x][to.y];

	    fromCell.clear = true;
	    toCell.clear = true;

	    var direction;
	    // TODO Check that cells are adjacent
	    if (from.y > to.y) {
	        direction = 0;
	    } else if (from.x < to.x) {
	        direction = 1;
	    } else if (from.y < to.y) {
	        direction = 2;
	    } else { // from.x > to.x
	        direction = 3;
	    }

	    fromCell.walls[direction] = false;
	    toCell.walls[this.reverseDirection(direction)] = false;
	};
	WalledGrid.prototype.fillCell = function(point) {

	    var cell = this.cells[point.x][point.y];

	    // We need to fill our open wall AND our neighbours open wall
	    // If a wall is gone, we know the cell exists
	    if (!cell.walls[0]) {
	        this.cells[cell.location.x][cell.location.y - 1].walls[this.reverseDirection(0)] = true;
	    }
	    if (!cell.walls[1]) {
	        this.cells[cell.location.x + 1][cell.location.y].walls[this.reverseDirection(1)] = true;
	    }
	    if (!cell.walls[2]) {
	        this.cells[cell.location.x][cell.location.y + 1].walls[this.reverseDirection(2)] = true;
	    }
	    if (!cell.walls[3]) {
	        this.cells[cell.location.x - 1][cell.location.y].walls[this.reverseDirection(3)] = true;
	    }

	    cell.clear = false;
	    cell.reset();
	};
	WalledGrid.prototype.reverseDirection = function(direction) {
	    return (direction + 2) % 4;
	};

	module.exports = WalledGrid;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);
	var WalledGrid = __webpack_require__(8);

	var GridCanvas = function GridCanvas(canvas, acc) {
	    this.canvas = canvas;
	    this.acc = acc;
	    this.cellSize = 50;
	};
	GridCanvas.prototype.setCellSize = function(cellSize) {
	    this.cellSize = cellSize;
	    if (this.grid) {
	        this.canvas.width = this.grid.width * this.cellSize;
	        this.canvas.height = this.grid.height * this.cellSize;
	    }
	};
	GridCanvas.prototype.setGrid = function(grid) {
	    this.grid = grid;
	    this.canvas.width = this.grid.width * this.cellSize;
	    this.canvas.height = this.grid.height * this.cellSize;

	    this.drawWalls = (grid instanceof WalledGrid);
	};
	// TODO Rename - Shall we call this "state data"?
	GridCanvas.prototype.setAcc = function(acc) {
	    this.acc = acc;
	};
	GridCanvas.prototype.convertPoint = function(x, y) {
	    return new Point(Math.floor(x / this.cellSize), Math.floor(y / this.cellSize));
	};
	GridCanvas.prototype.render = function() {
	    // TODO Check for grid and acc

	    if (!this.canvas.getContext) {
	        // TODO Handle this error
	        return;
	    }

	    var ctx = this.canvas.getContext("2d");
	    var x, y;

	    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	    // Draw border
	    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

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
	GridCanvas.prototype.drawCell = function(ctx, x, y, walls) {
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

	module.exports = GridCanvas;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);
	var Util = __webpack_require__(6);
	var WalledGrid = __webpack_require__(8);

	var ValidBlockCellSelector = function ValidBlockCellSelector(grid) {
	    this.grid = grid;
	};
	ValidBlockCellSelector.prototype.findValidCell = function(startingPoint) {

	    var neighbourCells = this.grid.getAdjacentNeighbours(startingPoint);
	    var numNeighbours = neighbourCells.length;
	    console.log("Checking cells " + Util.toString(neighbourCells) + "...");

	    var count = 0;
	    var direction = Math.floor(Math.random() * numNeighbours);
	    while (count < neighbourCells.length) {
	        var neighbourCell = neighbourCells[direction];
	        if (neighbourCell != null) {
	            console.log("Checking cell " + neighbourCell + " in direction " + direction + "...");
	            if (neighbourCell.clear) {
	                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");
	            } else if (this.isValidNewLocation(neighbourCell, direction)) {
	                console.log(neighbourCell.location + " is a valid target cell");
	                return neighbourCell;
	            } else {
	                console.log("Invalid target cell - has clear neighbours");
	            }
	        }

	        count++;
	        direction = (direction + 1) % numNeighbours;
	    }

	    console.log("Cannot find a valid cell!");
	    return null;
	};
	ValidBlockCellSelector.prototype.isValidNewLocation = function(cell, direction) {

	    var directionsToCheck;
	    if (direction == 1) {
	        directionsToCheck = [0, 1, 2, 3, 7];
	    } else if (direction == 3) {
	        directionsToCheck = [1, 2, 3, 4, 5];
	    } else if (direction == 5) {
	        directionsToCheck = [3, 4, 5, 6, 7];
	    } else { // direction == 7
	        directionsToCheck = [0, 1, 5, 6, 7];
	    }

	    var neighbours = this.grid.getAllNeighbours(cell.location);
	    for (var idx = 0; idx < directionsToCheck.length; idx++) {

	        var directionToCheck = directionsToCheck[idx];
	        var neighbour = neighbours[directionToCheck];

	        console.log("Checking neighbour in direction " + directionToCheck + ": " + neighbour);
	        if (neighbour != null && neighbour.clear) {
	            console.log("Found non-clear neighbour: " + neighbour);
	            return false;
	        }
	    }

	    return true;
	};

	var ValidWalledCellSelector = function ValidWalledCellSelector(grid) {
	    this.grid = grid;
	};
	ValidWalledCellSelector.prototype.findValidCell = function(startingPoint) {

	    var neighbourCells = this.grid.getAdjacentNeighbours(startingPoint);
	    var numNeighbours = neighbourCells.length;
	    console.log("Checking cells " + Util.toString(neighbourCells) + "...");

	    var count = 0;
	    var idx = Math.floor(Math.random() * numNeighbours);
	    while (count < neighbourCells.length) {
	        var neighbourCell = neighbourCells[idx];
	        if (neighbourCell != null) {
	            if (neighbourCell.clear) {
	                console.log(neighbourCell.location + " is an invalid target cell - has already been cleared");
	            } else {
	                console.log(neighbourCell.location + " is a valid target cell");
	                return neighbourCell;
	            }
	        }

	        count++;
	        idx = (idx + 1) % numNeighbours;
	    }

	    console.log("Cannot find a valid target cell!");
	    return null;
	};

	var MazeGenerator = function MazeGenerator(grid) {
	    this.grid = grid;
	    this.cellSelector = (this.grid instanceof WalledGrid) ? new ValidWalledCellSelector(this.grid) : new ValidBlockCellSelector(this.grid);
	};
	MazeGenerator.prototype.init = function(acc) {

	    acc.reversing = false;
	    acc.history = [];
	    acc.deadEnds = [];

	    // TODO Make sure the cell is a valid cell for blocks e.g not empty and clear on all sides
	    // Alternatively, start in a valid door position
	    var x = Math.floor(Math.random() * this.grid.width);
	    var y = Math.floor(Math.random() * this.grid.height);
	    this.location = new Point(x, y);

	    acc.currentPoint = this.location;

	    this.grid.clearCell(this.location);

	    return true;
	};
	MazeGenerator.prototype.step = function(acc) {

	    console.log("Current location is " + this.location);

	    var newCell = this.cellSelector.findValidCell(this.location);
	    if (newCell) {
	        this.moveForwardTo(acc, newCell);
	        console.log("Moved to " + newCell.location);
	    } else if (!this.moveBack(acc)) {
	        console.log("All moves exhausted!");
	        acc.currentPoint = null;
	        acc.reversing = false;
	        return false;
	    }

	    acc.currentPoint = this.location;
	    return true;
	};
	MazeGenerator.prototype.moveForwardTo = function(acc, newCell) {
	    acc.reversing = false;

	    acc.history.push(this.location);

	    this.grid.clearPath(this.location, newCell.location);

	    this.location = newCell.location;
	};
	MazeGenerator.prototype.moveBack = function(acc) {
	    if (acc.history.length == 0) {
	        return false;
	    }

	    if (acc.reversing == false) {
	        acc.deadEnds.push(this.location);
	    }
	    acc.reversing = true;
	    var previousLocation = acc.history.pop();
	    console.log('Returning to ' + previousLocation);
	    this.location = previousLocation;

	    return true;
	};

	module.exports = MazeGenerator;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var Point = __webpack_require__(2);
	var Rect = __webpack_require__(12);
	var Util = __webpack_require__(6);

	var RoomGenerator = function RoomGenerator(grid, roomLimit, maxRoomDimension) {
	    this.grid = grid;
	    this.limit = roomLimit;
	    // TODO Cannot be so big that we can't place 'count' rooms of average size on the grid
	    this.maxRoomSize = maxRoomDimension;
	    // TODO Parametetise failure ratio
	    this.failureRatio = 100;
	    this.count = 0;
	    this.failures = 0;
	};
	RoomGenerator.prototype.init = function(acc) {

	    acc.rooms = [];

	    this.potentialRooms = [];
	    for (var x = 0; x < this.limit; x++) {
	        // Minimum room size is 2x2
	        var width = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;
	        var height = Math.ceil(Math.random() * (this.maxRoomSize - 1)) + 1;

	        var room = new Rect(undefined, width, height);
	        this.potentialRooms.push(room);
	    }

	    this.potentialRooms.sort(function compare(a, b) {
	        return b.area - a.area;
	    });

	    console.log("Potentials rooms: " + Util.toString(this.potentialRooms));

	    return true;
	};
	RoomGenerator.prototype.step = function(acc) {

	    var room = this.potentialRooms.shift();
	    console.log("Trying to place room " + room);
	    // TODO The number of attempts should increase with the delay in animation, in which case we need to remember room
	    // We give up after 500 attempts so we don't spend to long here
	    for (var attempts = 0; attempts < 500; attempts++) {
	        if (this.placeRoom(room, acc)) {
	            break;
	        }
	        this.failures++;
	    }

	    console.log("Placed " + this.count + "/" + this.limit + ", failed " + this.failures + "/" + (this.count * this.failureRatio))

	    return ((this.potentialRooms.length > 0) && (this.failures <= (this.count * this.failureRatio)));
	};
	RoomGenerator.prototype.placeRoom = function(room, acc) {

	    // Rooms cannot be flush with,the grid edge
	    var x = Math.floor(Math.random() * (this.grid.width - 1)) + 1;
	    var y = Math.floor(Math.random() * (this.grid.height - 1)) + 1;
	    var location = new Point(x, y);

	    console.log('Attempting to place ' + room + ' at ' + location);

	    // Rooms cannot be over, or flush with,the grid edge
	    if (location.x + room.width >= this.grid.width) {
	        console.log("Cannot place room: too wide");
	        return false;
	    }
	    if (location.y + room.height >= this.grid.height) {
	        console.log("Cannot place room: too high");
	        return false;
	    }

	    // TODO Resetting the location is a bit dodgy
	    room.location = location;
	    for (var idx = 0; idx < acc.rooms.length; idx++) {
	        var existingRoom = acc.rooms[idx];
	        // TODO Allow a certain % of overlap to permit odd room shapes
	        if (existingRoom.intersection(room, 1, 1)) {
	            console.log("Failed to place room due to overlap with " + existingRoom + "!");
	            return false;
	        }
	    }

	    this.grid.clearCells(location, room.width, room.height);
	    this.count++;
	    acc.rooms.push(room);

	    return true;
	};

	module.exports = RoomGenerator;

/***/ },
/* 12 */
/***/ function(module, exports) {

	var Rect = function Rect(point, width, height) {
	    this.location = point;
	    this.width = width;
	    this.height = height;
	    this.area = this.width * this.height;
	};
	Rect.prototype.intersection = function(rect, border, gap) {

	    var x1 = this.location.x - border;
	    var x2 = this.location.x + this.width + border;
	    var y1 = this.location.y - border;
	    var y2 = this.location.y + this.height + border;

	    var x3 = rect.location.x - border;
	    var x4 = rect.location.x + rect.width + border;
	    var y3 = rect.location.y - border;
	    var y4 = rect.location.y + rect.height + border;

	    var x5 = Math.max(x1, x3);
	    var y5 = Math.max(y1, y3);
	    var x6 = Math.min(x2, x4);
	    var y6 = Math.min(y2, y4);

	    // Make sure we have a gap of at least 'gap' pixels or we'll still count it as an intersection
	    return !((x5 - x6) >= gap || ((y5 - y6) >= gap));
	};
	Rect.prototype.toString = function() {
	    return this.width + 'x' + this.height + ' at ' +  this.location;
	};

	module.exports = Rect;

/***/ }
/******/ ]);