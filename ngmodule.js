angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {
        $scope.params = {type: 'Dungeon', walls: true, width: 5, height: 5, size: 50, deadEnds: 50, speed : 50, birthThreshold: 3, deathThreshold: 4, iterations : 5};

        $scope.gridCanvas = new CANVAS.GridCanvas(document.getElementById("map"));

        $scope.running = false;

        var stop;
        $scope.startGeneration = function() {
            // Don't start if we are already generating
            if (angular.isDefined(stop)) {
                return;
            }

            $scope.running = true;

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

            stop = $interval(function() {
                var stepsRemain = $scope.mapGenerator.step();

                if (!stepsRemain) {
                    $scope.stopGeneration();
                }

                $scope.gridCanvas.render();
            }, $scope.params.speed);
        };

        $scope.stopGeneration = function() {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
                $scope.running = false;
            }
        };
    }]);