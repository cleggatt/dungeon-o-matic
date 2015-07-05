"use strict";

var Animator = function Animator(delay, scheduler, animate, complete) {
    this.delay = delay;
    this.scheduler = scheduler;
    this.animate = animate;
    this.complete = complete;
    this.running = false;
    this.paused = false;
};
Animator.prototype.start = function() {
    if (!this.running) {
        this.running = true;
        this.paused = false;
        startAnimation.call(this);
    }
};
Animator.prototype.pause = function() {
    if (this.running) {
        if (this.paused) {
            this.paused = false;
            startAnimation.call(this);
        } else {
            this.paused = true;
            stopAnimation.call(this);
        }
    }
};
Animator.prototype.stop = function() {
    this.running = false;
    this.paused = false;
    stopAnimation.call(this);
    this.complete();
};
Animator.prototype.step = function() {
    if (this.running) {
        this.paused = true;
        stopAnimation.call(this);
        animateFrame.call(this);
    }
};
// Private Animator methods
var startAnimation = function() {
    this.scheduler.schedule(animateFrame.bind(this), this.delay);
};
var animateFrame = function() {
    var stepsRemain = this.animate();
    if (!stepsRemain) {
       this.stop();
    }
};
var stopAnimation = function() {
    this.scheduler.cancel();
};

module.exports = Animator;