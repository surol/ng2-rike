"use strict";

var gulp = require('gulp');
var exec = require('child_process').exec;
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var wp = require('gulp-webpack');
var named = require('vinyl-named');
var del = require('del');
var watch = require('gulp-watch');

function compile(opts, cb) {
    exec(
        'node_modules/.bin/tsc ' + opts,
        function (err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb();
        });
}

gulp.task('compile', function(cb) {
    compile("-p .", cb);
});

gulp.task('watch-compile', function(cb) {
    compile('-p . --watch', cb);
});

gulp.task('clean-compiled', function () {
    return del([
        './ng2-rike/**/*.{d.ts,js,js.map}',
        './ng2-rike.{d.ts,js,js.map}'
    ]);
});


function bundleUmdTask(config, cb) {
    exec(
        'node_modules/.bin/rollup -c ' + config,
        function (err, stdout, stderr) {
            console.log(stdout);
            if (err) {
                console.error(stderr);
            }
            cb(err);
        });
}

gulp.task('bundle-umd', ['compile'], function(cb) {
    bundleUmdTask('rollup.config.js', cb);
});

gulp.task('bundle-umd-only', function(cb) {
    bundleUmdTask('rollup.config.js', cb);
});

gulp.task('watch-bundle-umd', ['bundle-umd-only'], function() {
    return watch(
        [
            'ng2-rike.js',
            '!ng2-rike.spec.js',
            'ng2-rike/**/*.js',
            '!ng2-rike/**/*.spec.js',
            'rollup.config.js'
        ], function() {
        bundleUmdTask('rollup.config.js', () => {});
    });
});

gulp.task('bundle-spec-umd', ['compile'], function(cb) {
    bundleUmdTask('rollup-spec.config.js', cb);
});

gulp.task('bundle-spec-umd-only', ['bundle-spec-umd-only'], function(cb) {
    bundleUmdTask('rollup-spec.config.js', cb);
});

gulp.task('watch-bundle-spec-umd', function() {
    return watch(['ng2-rike.js', 'ng2-rike/**/*.js', 'rollup-spec.config.js'], function() {
        bundleUmdTask('rollup-spec.config.js', () => {});
    });
});

var wpCommon = {
    resolve: {
        extensions: ['', '.js'],
        alias: {
            'ng2-rike': './bundles/ng2-rike-spec.umd.js'
        }
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618,
            compress: {
                warnings: false
            },
            mangle: {
                keep_fnames: true
            }
        }),
    ],
    output: {
        filename: 'ng2-rike-spec.js'
    }
};

function bundleTask(config) {
    gulp.src('bundle-spec.js').pipe(named())
        .pipe(wp(webpackMerge(wpCommon, config), webpack))
        .pipe(gulp.dest('bundles/'));
}

gulp.task('bundle-spec', ['bundle-spec-umd'], function() {
    return bundleTask();
});

gulp.task('bundle-spec-only', ['bundle-spec-umd-only'], function() {
    return bundleTask();
});

gulp.task('watch-bundle-spec', function () {
    return bundleTask(webpackMerge({watch: true}));
});

gulp.task('clean-bundles', function() {
    return del('bundles');
});


gulp.task('watch', ['watch-compile', 'watch-bundle-umd', 'watch-bundle-spec-umd', 'watch-bundle-spec']);

// Use if IDE (IntelliJ IDEA) compiles TypeScript by itself.
gulp.task('watch-ide', ['watch-bundle-umd', 'watch-bundle-spec-umd', 'watch-bundle-spec']);


gulp.task('default', ['bundle-umd', 'bundle-spec']);

gulp.task('clean', ['clean-compiled', 'clean-bundles']);
