module.exports = {
    entry: "./app/ngmodule.js",
    output: {
        path: __dirname + "/build/js",
        filename: "bundle.js",
        publicPath: ""
    },
    devServer: {
        contentBase: __dirname + "/app/"
    }
};