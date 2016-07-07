var gulp = require('gulp');
var ts = require('gulp-typescript');
var download = require('gulp-download');
var rename = require("gulp-rename");
var fs = require("fs");

// CONFIG
// ==============================
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));

/**
 * Checks to see that all TS files listed exist
 */
gulp.task('check-files', function(){

    // Make sure the files exist
    for (var i = 0, l = tsConfig.files.length; i < l; i++ )
        if(!fs.existsSync(tsConfig.files[i]))
        {
            console.log("File does not exist:" + tsConfig.files[i] );
            process.exit();
        }
})

// Builds each of the ts files into JS files in the output folder
gulp.task('ts-code', ['check-files'], function() {

    var src = tsConfig.files;

    return gulp.src(src, { base: "." })
        .pipe(ts({
            "module": tsConfig.compilerOptions.module,
            "noImplicitAny": tsConfig.compilerOptions.noImplicitAny,
            "removeComments": tsConfig.compilerOptions.removeComments,
            "noEmitOnError": tsConfig.compilerOptions.noEmitOnError,
            "declaration": tsConfig.compilerOptions.declaration,
            "sourceMap": tsConfig.compilerOptions.sourceMap,
            "preserveConstEnums": tsConfig.compilerOptions.preserveConstEnums,
            "target": tsConfig.compilerOptions.target,
            "allowUnreachableCode": tsConfig.compilerOptions.allowUnreachableCode,
            "allowUnusedLabels": tsConfig.compilerOptions.allowUnusedLabels
            }))
        .pipe(gulp.dest(tsConfig.compilerOptions.outDir));
});

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
gulp.task('install', function () {
     return Promise.all([
            getDefinition("https://raw.githubusercontent.com/MKHenson/users/dev/src/definitions/custom/definitions.d.ts", "src/definitions/required/", "webinate-users.d.ts")
         ]);
});

// Copies the distribution files from src to the dist folder
gulp.task('dist-files', function() {

    return gulp.src(['src/dist-src/*.json', 'src/dist-src/modepress-api/*.json'], { base: "src/dist-src/" })
        .pipe(gulp.dest(tsConfig.compilerOptions.outDir));
});

gulp.task('build-all', ['ts-code', 'dist-files']);