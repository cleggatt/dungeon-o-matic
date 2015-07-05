"use strict";

var NgScheduler = function NgScheduler(interval) {
    this.interval = interval;
    this.promise = null;
};
NgScheduler.prototype.schedule = function(fn, delay) {
    if (this.promise != null) {
        throw new Error("NgScheduler.schedule() called in invalid state!");
    }
    this.promise = this.interval(fn, delay);
};
NgScheduler.prototype.cancel = function() {
    if (this.promise != null) {
        this.interval.cancel(this.promise);
        this.promise = null;
    }
};

module.exports = NgScheduler;
