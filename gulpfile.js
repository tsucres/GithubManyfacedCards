'use strict';

var gulp = require('gulp');
//var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');

var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');

var merge = require('merge-stream');

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


function buildEmbeddedTheme(themeName) {
    return gulp.src("src/themes/" + themeName + ".html")
        .pipe(preprocess({context: {EMBED_GMC: true}}))
        .pipe(rename(function (path) { path.extname = ".gmc.html" }))
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embeded"))
        .pipe(rename(function (path) { path.extname = ".min.html" }))
        .pipe(minifyInline())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embeded"))
        .pipe(gzip())
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embeded"));
}
/**
    Builds css, js and template for the specified theme.

    Initially, the following files (named after the theme) should exist:
        - a css file in themes/css/<themeName>.css
        - a js file in themes/js/<themeName>.js
        - a template (html) file in themes/templates/<themeName>.html

    Those file are preprocessed and compiled (and minified) in dist/themes/<themeName>

*/
function buildTheme(themeName) {
    var css = gulp.src(["src/themes/css/" + themeName + ".css"])
        .pipe(preprocess({}))
        .pipe(gulp.dest("./dist/themes/" + themeName))
        .pipe(cssnano())
        .pipe(rename(function (path) { path.extname = ".min.css" }))
        .pipe(gulp.dest("./dist/themes/" + themeName));

    var js = gulp.src(["src/themes/js/" + themeName + ".js"])
        .pipe(preprocess({}))
        .pipe(gulp.dest("./dist/themes/" + themeName))
        .pipe(uglify())
        .pipe(rename(function (path) { path.extname = ".min.js" }))
        .pipe(gulp.dest("./dist/themes/" + themeName));

    var html = gulp.src(["src/themes/templates/" + themeName + ".html"])
        .pipe(preprocess({}))
        .pipe(gulp.dest("./dist/themes/" + themeName));

    var merged = merge(css, js);
    merged.add(html);
    return merged;
}
gulp.task('theme_gh_basic', function() {
    return buildTheme('gh_basic');
});
gulp.task('theme_gh_full', function() {
    return buildTheme('gh_full');
});
gulp.task('theme_gh_pure', function() {
    return buildTheme('gh_pure');
});
gulp.task('theme_gh_recommendation', function() {
    return buildTheme('gh_recommendation');
});



/** 
    Build the themes: complete html markup intendend to be used in 
    iframes. They contains the template of the theme, the css style 
    and the all the js functions the template needs. 
*/
gulp.task('themes', ['theme_gh_basic', 'theme_gh_full', 'theme_gh_pure', 'theme_gh_recommendation']);

/**
    Similar to the 'themes' task. In this task, the gmc.js library 
    is directly embedded in the themes. This allows make iframe 
    totally independent from the host page.
*/
gulp.task('embed_themes', function() {
    var gh_basic = buildEmbeddedTheme("gh_basic");
    var gh_pure = buildEmbeddedTheme("gh_pure");
    var gh_full = buildEmbeddedTheme("gh_full");
    var gh_recommendation = buildEmbeddedTheme("gh_recommendation");

    var embedThemes = merge(gh_basic, gh_pure);
    embedThemes.add(gh_full);
    embedThemes.add(gh_recommendation);
    return embedThemes;
});

/**
    Minify the library
*/
gulp.task('gmc', function() {
	return gulp.src(["src/*.js"])
        .pipe(rename(function (path) { path.extname = ".min.js" }))
        .pipe(uglify())
        .pipe(gulp.dest("./dist"))
        .pipe(gzip())
        .pipe(gulp.dest("./dist"));

});

/**
    Build the demo webpage. 
    The demo page contains the markup of the gh_pure theme. 
    This markup is included at this stage. This contributes to 
    keeping the project DRY.
*/
gulp.task('demo', function() {
    return gulp.src(["src/demo.html", "src/demo/demov2.html"])
        .pipe(rename(function (path) { path.basename = "index" }))
        .pipe(preprocess({context: {}}))
        .pipe(gulp.dest('.'))

});


gulp.task('default',['gmc']);
gulp.task('all',['gmc', 'demo', 'embed_themes', 'themes']);

