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