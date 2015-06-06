var MAP = MAP || {};

MAP.Generator = function(builders) {

    this.acc = {};

    this.allBuilders = builders.slice(0);
    this.currentBuilder = this.allBuilders.shift();

    // TODO Handle a false return value from this
    this.currentBuilder.init(this.acc);
}
MAP.Generator.prototype.step = function() {

    if (this.currentBuilder.step(this.acc)) {
        return true;
    }

    if (this.allBuilders.length == 0) {
        return false;
    }

    this.currentBuilder = this.allBuilders.shift();

    return this.currentBuilder.init(this.acc);
};