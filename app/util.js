var toString = function toString(o) {
    if (o instanceof Array) {
        var buff = "";
        for (var idx = 0; idx < o.length; idx++) {
            var item = o[idx];
            if (item) {
                buff += o[idx].toString() + ', ';
            } else {
                buff += 'null, ';
            }
        }
        return buff.slice(0, -2);

    } else {
        return o.toString()
    }
};

module.exports.toString = toString;