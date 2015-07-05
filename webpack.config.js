var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./app/ngmodule.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle-[hash].js",
        publicPath: ""
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, "app/")
                ],
                loader: "jshint-loader"
            }
        ]
    },
    jshint: {
        emitErrors: true,
        failOnHint: true
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'app/index.html',
        inject: 'head'
    })],
    devServer: {
        contentBase: __dirname + "/app/"
    }
};