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

// CONFIG
// ==============================
var outDir = "../server/resources/admin";
var outDirDefinitions = "../server/definitions";
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));
var tsFiles = tsConfig.files;

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
})

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task('ts-code', function() {

    return gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": "amd",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": true,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5",
            "noImplicitAny": false,
            "out":"main.js",
            }))
        .pipe(gulp.dest(outDir));
});

/**
 * Copies the html source to its output directory
 */
gulp.task('copy-html', function() {

    return gulp.src("html/**", { base: "html" })
        .pipe(gulp.dest(outDir));

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

    var sources = gulp.src([
        './third-party/jquery/dist/jquery.js',
        './third-party/angular/angular.js',
        './third-party/angular-ui-router/release/angular-ui-router.js',
        './third-party/angular-sanitize/angular-sanitize.js',
        './third-party/angular-animate/angular-animate.js',
        './third-party/angular-loading-bar/build/loading-bar.js',
        './third-party/angular-loading-bar/build/loading-bar.css',
        './third-party/angular-file-upload/dist/ng-file-upload.js',
        './third-party/tinymce/**'
    ], { base: "third-party" } )
        .pipe(gulp.dest(outDir + "/third-party"));
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
     merge(requiredDeclarationFiles, tsDefinition)
        .pipe(gulp.dest(outDirDefinitions));
});

gulp.task('build-all', [ 'deploy-third-party', 'copy-html', 'ts-code', 'ts-code-declaration']);