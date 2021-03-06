'use strict';

var gulp = require('gulp');
//var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var preprocess = require('gulp-preprocess');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var nunjucksRender = require('gulp-nunjucks-render');
var htmlclean = require('gulp-htmlclean');

var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');

var merge = require('merge-stream');

var fs = require('fs')
var njManageEnvironment = function(environment) {
  environment.addFilter('preCode', function(str) {
    str = str.replace(/\n\s+/g,'\n');
    str = str.replace(/\\t/g,'\t');
    str = str.replace(/\\n/g,'\n');
    str = environment.filters.escape(str);//
    return str;
  });
  environment.addGlobal('includeFile', (src) => fs.readFileSync(src));
}


function buildThemesWithPreprocessingContext(context, namePrefix) {
    return gulp.src(["src/themes/*.html"])
        .pipe(preprocess({context: context}))
        .pipe(rename(function (path) { path.extname = namePrefix + ".html" }))
        .pipe(gulp.dest('./dist/themes'))
        .pipe(rename(function (path) { path.extname = ".min.html" }))
        //.pipe(minifyInline())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist/themes'))
        .pipe(gzip())
        .pipe(gulp.dest('./dist/themes'));
}


function buildEmbeddedTheme(themeName) {
    return gulp.src("src/themes/" + themeName + ".html")
        .pipe(preprocess({context: {EMBED_GMC: true}}))
        .pipe(rename(function (path) { path.basename="embedded"; path.extname = ".gmc.html" }))
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embedded"))
        .pipe(rename(function (path) { path.extname = ".min.html" }))
        .pipe(minifyInline())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embedded"))
        .pipe(gzip())
        .pipe(gulp.dest("./dist/themes/" + themeName + "/embedded"));
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
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
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
gulp.task('theme_codeshape', function() {
    return buildTheme('codeshape');
});
gulp.task('theme_gh_usercard', function() {
    return buildTheme('gh_usercard');
});


/** 
    Build the themes: complete html markup intendend to be used in 
    iframes. They contains the template of the theme, the css style 
    and the all the js functions the template needs. 
*/
gulp.task('themes', ['theme_gh_basic', 'theme_gh_full', 'theme_gh_pure', 'theme_gh_recommendation', 'theme_codeshape', 'theme_gh_usercard']);

/**
    Similar to the 'themes' task. In this task, the gmc.js library 
    is directly embedded in the themes. This allows make iframe 
    totally independent from the host page.
*/
gulp.task('embed_themes', ['gmc', 'themes'], function() {
    var gh_basic = buildEmbeddedTheme("gh_basic");
    var gh_pure = buildEmbeddedTheme("gh_pure");
    var gh_full = buildEmbeddedTheme("gh_full");
    var gh_recommendation = buildEmbeddedTheme("gh_recommendation");
    var codeshape = buildEmbeddedTheme("codeshape");
    var gh_usercard = buildEmbeddedTheme("gh_usercard");

    var embedThemes = merge(gh_basic, gh_pure);
    embedThemes.add(gh_full);
    embedThemes.add(gh_recommendation);
    embedThemes.add(codeshape);
    embedThemes.add(gh_usercard);
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
gulp.task('demo', ['gmc', 'themes', 'embed_themes'], function() {
    // Build and move css (from /src/demo to /demo)
    var demoCSS = gulp.src(["src/demo/css/*.css"])
        .pipe(preprocess({context: {}}))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./demo/css'));

    // Build and move js
    var demoJS = gulp.src(["src/demo/js/*.js"])
        .pipe(preprocess({context: {}}))
        .pipe(uglify())
        .pipe(rename(function (path) { path.extname = ".min.js" }))
        .pipe(gulp.dest('./demo/js'));

    var fonts = gulp.src(["src/demo/fonts/*"])
        .pipe(gulp.dest('./demo/fonts'));

    // Build and move html
    var demoHTML = gulp.src(["src/demo/demo.html"])
        .pipe(rename(function (path) { path.basename = "index" }))
        .pipe(preprocess({context: {}}))
        .pipe(nunjucksRender({
            path: '.',
            manageEnv: njManageEnvironment,
        }))
        .pipe(htmlclean({}))
        .pipe(gulp.dest('.'));

    var demo = merge(demoCSS, demoJS, fonts, demoHTML);
    
    return demo;
});

gulp.task('generator', ['demo'], function() {
    return gulp.src(["src/demo/generator.html"])
        .pipe(preprocess({context: {}}))
        .pipe(nunjucksRender({
            path: '.',
            manageEnv: njManageEnvironment,
        }))
        .pipe(gulp.dest('./demo'));
})

function buildEmbeddedThemeTestPage(method, theme_name, test_value) {
    return gulp.src(["src/demo/tests/" + method + "_template.html"])
            .pipe(rename(function(th_name) { return function(path) { 
                                path.basename += "_" + th_name; }}(theme_name)
            ))
            .pipe(nunjucksRender({
                path: '.',
                data: {
                    theme_name: theme_name,
                    test_value: test_value,
                }
            }))
            .pipe(preprocess({context: {}}))
            .pipe(gulp.dest('./demo/tests/' + method));
}
function buildMethodTestPage(method, text_method, themes) {
    return gulp.src(["src/demo/tests/test_page_template.html"])
            .pipe(rename(function(th_name) { return function(path) { 
                                path.basename = method; }}(method)
            ))
            .pipe(nunjucksRender({
                path: '.',
                data: {
                    theme_names: themes,
                    method: method,
                    text_method:text_method,
                }
            }))
            .pipe(gulp.dest('./demo/tests/' + method));
}
gulp.task('tests', ['themes', 'embed_themes'], function() {
    var methods = ["easy", "efficient", "more_efficient"];
    var text_methods = ["easy", "efficient", "more_efficient"];
    var parameters = {"easy": {
        "repo_test": "rn=tensorflow/tensorflow",
        "user_test": "un=tensorflow",
    }, "efficient": {
        "repo_test": "data-gmc-repo='tensorflow/tensorflow'",
        "user_test": "data-gmc-user='tensorflow'",
    }, "more_efficient": {
        "repo_test": "data-gmc-repo='tensorflow/tensorflow'",
        "user_test": "data-gmc-user='tensorflow'",
    }};
    var theme_types = {"gh_recommendation": "repo_test", "gh_basic": "repo_test", "gh_pure": "repo_test", "gh_full": "repo_test", "codeshape": "user_test", "gh_usercard": "user_test"};

    
    var task = merge();
    for (var method_id in methods) {
        var method = methods[method_id];
        var text_method = text_methods[method_id];
        // Build the test page for this method
        var methodTestPageBuild = merge(buildMethodTestPage(method, text_method, Object.keys(theme_types)));

        for (var theme_name in theme_types) {
            // Build the page that will be embeded in an iframe in the test page, for a specific theme.
            methodTestPageBuild.add(buildEmbeddedThemeTestPage(method, theme_name, parameters[method][theme_types[theme_name]])); 
        }
        task.add(methodTestPageBuild);
    }
    return task;

});

gulp.task('default',['gmc']);
gulp.task('all',['gmc', 'embed_themes', 'themes', 'demo', 'tests', 'generator']);

