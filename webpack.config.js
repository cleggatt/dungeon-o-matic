var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: "./app/ngmodule.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle-[hash].js",
        publicPath: ""
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'app/index.html',
        inject: 'head'
    })],
    devServer: {
        contentBase: __dirname + "/app/"
    }
};