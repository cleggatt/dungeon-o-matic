var MapGenerator = function MapGenerator(builders) {

    this.acc = {};

    var allBuilders = builders.slice(0);
    var currentBuilder = allBuilders.shift();

    // TODO Handle false from this
    currentBuilder.init(this.acc);

    this.step = function() {

        if (currentBuilder.step(this.acc)) {
            return true;
        }

        if (allBuilders.length == 0) {
            return false;
        }

        currentBuilder = allBuilders.shift();

        return currentBuilder.init(this.acc);
    }
};