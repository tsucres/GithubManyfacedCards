'use strict';

var gulp = require('gulp');
//var concat = require('gulp-concat');
//var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');

var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');


function buildThemesWithPreprocessingContext(context, namePrefix) {
    return gulp.src(["src/themes/*.html"])
        .pipe(preprocess({context: context}))
        .pipe(rename(function (path) { path.extname = namePrefix + ".html" }))
        .pipe(gulp.dest('./dist/themes'))
        .pipe(rename(function (path) { path.extname = ".min.html" }))
        .pipe(minifyInline())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/themes'))
        .pipe(gzip())
        .pipe(gulp.dest('./dist/themes'));
}
/** 
    Build the themes: complete html markup intendend to be used in 
    iframes. They contains the template of the theme, the css style 
    and the all the js functions the template needs. 
*/
gulp.task('themes', function() {
    return buildThemesWithPreprocessingContext({EMBED_GMC: false}, "");
});

/**
    Similar to the 'themes' task. In this task, the gmc.js library 
    is directly embedded in the themes. This allows make iframe 
    totally independent from the host page.
*/
gulp.task('embed_themes', function() {
    return buildThemesWithPreprocessingContext({EMBED_GMC: true}, ".gmc");
});

/**
    Minify the library
*/
gulp.task('gmc', function() {
	return gulp.src(["src/*.js"])
        .pipe(rename(function (path) { path.extname = ".min.js" }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'))
        .pipe(gzip())
        .pipe(gulp.dest('./dist'));

});

/**
    Build the demo webpage. 
    The demo page contains the markup of the gh_pure theme. 
    This markup is included at this stage. This contributes to 
    keeping the project DRY.
*/
gulp.task('demo', function() {
    return gulp.src(["src/demo.html"])
        .pipe(rename(function (path) { path.basename = "index" }))
        .pipe(preprocess({context: {}}))
        .pipe(gulp.dest('.'))

});


gulp.task('default',['gmc']);
gulp.task('all',['gmc', 'demo', 'embed_themes', 'themes']);

