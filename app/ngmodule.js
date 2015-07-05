"use strict";

var Animator = require("./animator.js");
var DungeonOMatic = require("./dungeonomatic.js");
var GridCanvas = require("./gridcanvas.js");
var NgScheduler = require("./ngscheduler.js");

angular.module('generateApp', [])
    .controller('MazeController', ['$scope', '$interval', function($scope, $interval) {

        $scope.params = {
            type: 'Dungeon',
            walls: true,
            width: 10,
            height: 10,
            size: 15,
            roomLimit : 15,
            maxRoomDimension: 10,
            deadEnds: 50,
            speed : 500,
            birthThreshold: 3,
            deathThreshold: 4,
            iterations : 5
        };

        var gridCanvas = new GridCanvas(document.getElementById("map"));
        var getPosition = function(event) {
            if (gridCanvas.toggleCell(event.offsetX, event.offsetY)) {
                gridCanvas.render();
            }
        };
        gridCanvas.canvas.addEventListener("mousedown", getPosition, false);

        var scheduler = new NgScheduler($interval);

        var animator;
        var updateStateFlags = function() {
            if (animator == null) {
                $scope.generating = false;
                $scope.paused = false;
            } else {
                $scope.generating = animator.running;
                $scope.paused = animator.paused;
            }
        };
        var complete = function() {
            animator = null;
            gridCanvas.setAcc(null);
            updateStateFlags();
            gridCanvas.render();
        };

        $scope.start = function() {
            if (animator != null) {
                return;
            }

            var dungeonOMatic = new DungeonOMatic($scope.params);

            // Wire up the grid canvas
            gridCanvas.setGrid(dungeonOMatic.grid);
            gridCanvas.setAcc(dungeonOMatic.generator.acc);
            gridCanvas.setCellSize($scope.params.size);

            // Set up the animator callbacks
            var animate = function () {
                var stepsRemain = dungeonOMatic.generator.step();
                gridCanvas.render();
                return stepsRemain;
            };

            animator = new Animator($scope.params.speed, scheduler, animate, complete);
            animator.start();

            updateStateFlags();
        };

        $scope.pause = function() {
            if (animator != null) {
                animator.pause();
                updateStateFlags();
            }
        };

        $scope.step = function() {
            if (animator != null) {
                animator.step();
                updateStateFlags();
            }
        };

        $scope.stop = function() {
            if (animator != null) {
                animator.stop();
            }
        };

        $scope.$on('$destroy', function() {
            if (animator != null) {
                animator.stop();
            }
        });

        updateStateFlags();
    }]);