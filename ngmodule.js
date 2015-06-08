angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {
        $scope.params = {type: 'Dungeon', walls: true, width: 5, height: 5, size: 50, deadEnds: 50, speed : 50, birthThreshold: 3, deathThreshold: 4, iterations : 5};

        $scope.gridCanvas = new CANVAS.GridCanvas(document.getElementById("map"));

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

            var builders;

            if ($scope.params.type == 'Dungeon') {
                $scope.grid = $scope.params.walls ? new GRID.WalledGrid($scope.params.width, $scope.params.height) :
                    new GRID.BlockGrid($scope.params.width, $scope.params.height);
                builders = [
                    new MAZE.Generator($scope.grid),
                    new FILLER.DeadEndFiller($scope.grid, parseInt($scope.params.deadEnds))
                ];
            } else {
                $scope.grid = new GRID.BlockGrid($scope.params.width, $scope.params.height);
                builders = [
                    new CAVE.Generator($scope.grid, $scope.params.iterations, $scope.params.birthThreshold, $scope.params.deathThreshold),
                    // TODO Add a filler to flood fill to work out which is the main cavern
                ];
            }

            $scope.mapGenerator = new MAP.Generator(builders);

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
    }]);