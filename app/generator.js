module.exports.Generator = function(builders) {

    this.acc = {};

    this.allBuilders = builders.slice(0);
    this.currentBuilder = null;
};
module.exports.Generator.prototype.step = function() {

    if (this.currentBuilder == null) {
        if (this.allBuilders.length == 0) {
            // To reach here, we must have been created with no builders, or step() was call after it has returned false
            return false;
        }

        this.currentBuilder = this.allBuilders.shift();
        return this.currentBuilder.init(this.acc);
    }

    if (this.currentBuilder.step(this.acc)) {
        return true;
    }

    this.currentBuilder = null;
    return this.allBuilders.length > 0;
};