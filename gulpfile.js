var gulp = require('gulp');
var gutil = require("gulp-util");
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");

var webpackConfig = require("./webpack.config.js");

gulp.task('default', ['lint'], function () {
    return gulp.src('spec/*.js')
        .pipe(jasmine());
});

gulp.task('lint', function() {
    return gulp.src(['app/*.js', 'spec/*.js', '*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
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