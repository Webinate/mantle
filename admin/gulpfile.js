var gulp = require('gulp');
var fs = require('fs');
var concat = require('gulp-concat');
var ts = require('gulp-typescript');
var merge = require('merge-stream');
var gutil = require('gulp-util');
var gunzip = require('gulp-gunzip');
var request = require('request');
var untar = require('gulp-untar');
var source = require('vinyl-source-stream');
var filter = require('gulp-filter');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var uglify = require("gulp-uglify");
var gulpif = require("gulp-if");
var sprity = require('sprity');
var sass = require('gulp-sass');
var spritySass = require('sprity-sass');
var rimraf = require('rimraf');
var download = require('gulp-download');
var rename = require("gulp-rename");
var cleanCss = require('gulp-clean-css');

// CONFIG
// ==============================
var outDir = "./dist";
var outDirDefinitions = "../server/dist/definitions";
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));
var tsFiles = tsConfig.files;
var thirdPartyFiles =  [
    './third-party/jquery/dist/jquery.js',
    './third-party/angular/angular.js',
    './third-party/angular-ui-router/release/angular-ui-router.js',
    './third-party/angular-sanitize/angular-sanitize.js',
    './third-party/angular-animate/angular-animate.js',
    './third-party/angular-loading-bar/build/loading-bar.js',
    './third-party/angular-loading-bar/build/loading-bar.css',
    './third-party/angular-file-upload/dist/ng-file-upload.js'
];

/**
 * Checks to see that all TS files listed exist
 */
gulp.task('check-files', function(){

    // Make sure the files exist
    for (var i = 0, l = tsFiles.length; i < l; i++ )
        if(!fs.existsSync(tsFiles[i]))
        {
            console.log("File does not exist:" + tsFiles[i] );
            process.exit();
        }
});

gulp.task('sass', ['sprites'], function(){

    // Compile all sass files into temp/css
    return gulp.src('./lib/style.scss', { base: "./lib" })
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(outDir + '/css'))
})

gulp.task('sass-release', ['sprites'], function() {

    // Compile all sass files into temp/css
    return gulp.src('./lib/style.scss', { base: "./lib" })
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(gulp.dest(outDir + '/css'))
})

/**
 * Generate dist/media/sprites/sprite.png and /lib/temp/sprite.scss
 */
gulp.task('sprites', function () {
  return sprity.src({
    src: './lib/media/sprites/**/*.{png,jpg}',
    style: './sprites.scss',
    cssPath: '/media/sprites',
    name: 'sprites',
    orientation : 'binary-tree',
    prefix: 'sprite',
    processor: 'sass',
    'style-type': 'scss',
    margin:0
  })
  .pipe(gulpif('*.png', gulp.dest( outDir + '/media/sprites'), gulp.dest(  "lib/temp-css"  )))
});

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task('ts-code', ['check-files'], function() {

    return gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": tsConfig.compilerOptions.module,
            "removeComments": tsConfig.compilerOptions.removeComments,
            "noEmitOnError": tsConfig.compilerOptions.noEmitOnError,
            "declaration": tsConfig.compilerOptions.declaration,
            "sourceMap": tsConfig.compilerOptions.sourceMap,
            "preserveConstEnums": tsConfig.compilerOptions.preserveConstEnums,
            "target": tsConfig.compilerOptions.target,
            "noImplicitAny": tsConfig.compilerOptions.noImplicitAny,
            "allowUnreachableCode": tsConfig.compilerOptions.allowUnreachableCode,
            "allowUnusedLabels": tsConfig.compilerOptions.allowUnusedLabels,
            "out":"main.js",
            }))
        .pipe(gulp.dest(outDir));
});

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task('ts-code-release', ['check-files'], function() {

    return gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": tsConfig.compilerOptions.module,
            "removeComments": tsConfig.compilerOptions.removeComments,
            "noEmitOnError": tsConfig.compilerOptions.noEmitOnError,
            "declaration": tsConfig.compilerOptions.declaration,
            "sourceMap": tsConfig.compilerOptions.sourceMap,
            "preserveConstEnums": tsConfig.compilerOptions.preserveConstEnums,
            "target": tsConfig.compilerOptions.target,
            "noImplicitAny": tsConfig.compilerOptions.noImplicitAny,
            "allowUnreachableCode": tsConfig.compilerOptions.allowUnreachableCode,
            "allowUnusedLabels": tsConfig.compilerOptions.allowUnusedLabels,
            "out":"main.js",
            }))
        .pipe(uglify())
        .pipe(gulp.dest(outDir));
});

/**
 * Copies the html source to its output directory
 */
gulp.task('copy-index', function() {

    return gulp.src(["lib/index.jade", "lib/css/mce-style.css", "lib/media/images/**.*"], { base: "lib" })
        .pipe(gulp.dest(outDir));

});

/**
 * Copies the html source to its output directory
 */
gulp.task('copy-index-release', function() {

    return Promise.all([

        gulp.src( "lib/index-prod.jade", { base: "lib" })
            .pipe(rename("index.jade"))
            .pipe(gulp.dest(outDir)),

        gulp.src([
            "lib/media/images/**/*.*",
            "lib/css/mce-style.css"
            ], { base: "lib" })
        .pipe(gulp.dest(outDir))
    ]);
});



/**
 * Deletes a folder and all its children recursively
 * @param {string} path The folder path to remove
 */
function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else
                fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
    }
};

/**
 * This function downloads a definition file from github and writes it to a destination
 * @param {string} url The url of the file to download
 * @param {string} dest The destination folder to move the file to
 */
function getDefinition(url, dest, name) {
    return new Promise(function(resolve, reject) {
        download(url)
            .pipe(rename(name))
            .pipe(gulp.dest(dest))
            .on('error', function(err) {
                throw(err)
            })
            .on('end', function() {
                resolve(true);
            })
    });
}

/**
 * Downloads the definition files used in the development of the application and moves them into the definitions folder
 */
gulp.task('install-definitions', function () {
     return Promise.all([
            getDefinition("https://raw.githubusercontent.com/MKHenson/users/dev/src/definitions/custom/definitions.d.ts", "lib/definitions/required/", "webinate-users.d.ts")
         ]);
});

/**
 * Downloads a tarbal from a given url and unzips it into a specified folder
 * @param {string} url The URL of the tarball to download
 * @param {string} folder The folder we are moving the contents to
 */
function downloadTarball(url, folder){
    return new Promise(function(resolve, reject){
        gutil.log('Downloading file "'+ url +'" into folder "' + folder + '"');
        return request(url)
        .pipe(source('hello.tar.gz'))
        .on('end', function(){
            gutil.log('Unzipping... "'+ url +'"');
        })
        .pipe(gunzip())
        .pipe(untar())
        .pipe(gulp.dest(folder))
        .on('end', function() {
            var folders = fs.readdirSync(folder);
            gulp.src( folder + '/' + folders[0] + "/**/*.*" )
                .pipe(gulp.dest(folder))
                .on('end', function() {
                    deleteFolderRecursive(folder + '/' + folders[0]);
                    gutil.log(gutil.colors.green('Finished download of "'+ url +'"'));
                    resolve(true);
                });
        })
    });
}

/**
 * Downloads each of the third party archives and unzips them into the third-party folder respectively
 */
gulp.task('install-third-parties', function () {
    return Promise.all([
        downloadTarball("https://github.com/angular/bower-angular/tarball/v1.5.3-build.4695+sha.7489d56", './third-party/angular'),
        downloadTarball("https://github.com/angular/bower-angular-animate/tarball/v1.5.3-build.4691+sha.e34ef23", './third-party/angular-animate'),
        downloadTarball("https://github.com/angular/bower-angular-sanitize/tarball/v1.5.3-build.4691+sha.e34ef23", './third-party/angular-sanitize'),
        downloadTarball("https://github.com/angular-ui/ui-router/tarball/0.2.18", './third-party/angular-ui-router'),
        downloadTarball("https://github.com/jquery/jquery/tarball/2.2.2", './third-party/jquery'),
        downloadTarball("https://github.com/chieffancypants/angular-loading-bar/tarball/0.9.0", './third-party/angular-loading-bar'),
        downloadTarball("https://github.com/tinymce/tinymce-dist/tarball/4.3.8", './third-party/tinymce'),
        downloadTarball("https://github.com/danialfarid/ng-file-upload/tarball/12.0.4", './third-party/angular-file-upload')
    ]);
});


/**
 * Copies the required third party files to the index file
 */
gulp.task('deploy-third-party', function() {

    var thirdParties = thirdPartyFiles.concat(['./third-party/tinymce/**']);

    return gulp.src(thirdParties, { base: "third-party" } )
        .pipe(gulp.dest(outDir + "/third-party"));
});

/**
 * Copies the required third party files to the index file. Also concatenates the files into 1, compressed, JS file
 */
gulp.task('deploy-third-party-release', function() {

    const jsFilter = filter('**/*.js', {restore: true});
    const cssFilter = filter('**/*.css', {restore: true});

    return Promise.all( [
        gulp.src( thirdPartyFiles, { base: "third-party" } )
            .pipe(jsFilter)
            .pipe(concat("third-party.min.js"))
            .pipe(uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
            .pipe(cleanCss())
            .pipe(concat("third-party.min.css"))
            .pipe(cssFilter.restore)
            .pipe(gulp.dest(outDir + "/third-party")),

        gulp.src(['./third-party/tinymce/**'], { base: "third-party" } )
            .pipe(gulp.dest(outDir + "/third-party"))
    ]);
});

/**
 * Builds the definition
 */
gulp.task('html-to-ng', function() {
    return gulp.src("./lib/**/*.html")
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            moduleName: "admin-templates",
            prefix: ""
        }))
        .pipe(concat("partials.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(outDir + "/templates"));
});

/**
 * Builds the definition
 */
gulp.task('ts-code-declaration', function() {

    var requiredDeclarationFiles = gulp.src([
        "./lib/definitions/custom/modepress-client.d.ts",
    ]);

    var tsDefinition = gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": "amd",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": true,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5",
            "out":"definitions.js",
            "noImplicitAny": false
        })).dts;


     // Merge the streams
     return merge(requiredDeclarationFiles, tsDefinition)
        .pipe(gulp.dest(outDirDefinitions));
});

gulp.task('install', [ 'install-definitions', 'install-third-parties']);
gulp.task('build-all', [ 'sass', 'copy-index', 'deploy-third-party', 'html-to-ng', 'ts-code', 'ts-code-declaration']);
gulp.task('build-all-release', [ 'sass-release', 'copy-index-release', 'deploy-third-party-release', 'html-to-ng', 'ts-code-release', 'ts-code-declaration']);