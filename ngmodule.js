angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {
        $scope.params = {walls: true, width: 5, height: 5, size: 50, deadEnds: 100, speed : 50};

        $scope.gridCanvas = new GridCanvas(document.getElementById("map"));

        var stop;
        $scope.startGeneration = function() {
            // Don't start if we are already generating
            if (angular.isDefined(stop)) {
                return;
            }

            $scope.grid = $scope.params.walls ? new WalledGrid($scope.params.width, $scope.params.height) :
                new BlockGrid($scope.params.width, $scope.params.height);

            $scope.mapGenerator = new MapGenerator([
                new MazeBuilder($scope.grid),
                new DeadEndFiller($scope.grid, parseInt($scope.params.deadEnds))
            ]);

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
            }
        };
    }]);