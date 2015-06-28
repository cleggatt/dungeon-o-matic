var BlockGrid = require("./blockgrid.js");
var CaveGenerator = require("./cavegenerator.js");
var CompositeGenerator = require("./compositegenerator.js");
var DoorGenerator = require("./doorgenerator.js");
var FillGenerator = require("./fillgenerator.js");
var GridCanvas = require("./gridcanvas.js");
var MazeGenerator = require("./mazegenerator.js");
var RoomGenerator = require("./roomgenerator.js");
var WalledGrid = require("./walledgrid.js");

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