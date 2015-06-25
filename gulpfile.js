var gulp = require('gulp');
var gutil = require("gulp-util");
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var jasmine = require('gulp-jasmine');

var webpackConfig = require("./webpack.config.js");

gulp.task('default', function () {
    return gulp.src('spec/*.js')
        .pipe(jasmine());
});

gulp.task("webpack", function(callback) {
    webpack(webpackConfig, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // TODO output options
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {
    new WebpackDevServer(webpack(webpackConfig), {
        contentBase: "app/"
    }).listen(8080, "localhost", function(err) {
            if(err) throw new gutil.PluginError("webpack-dev-server", err);
            // Server listening
            gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
            // keep the server alive or continue?
            // callback();
        });
});