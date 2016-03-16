var gulp = require('gulp');
var ts = require('gulp-typescript');
var download = require('gulp-download');
var rename = require("gulp-rename");

// CONFIG
// ==============================
var outDir = "../server";

// Builds each of the ts files into JS files in the output folder
gulp.task('ts-code', function() {

    return gulp.src(['main.ts', 'modepress-api.ts', 'src/**/*.ts', 'src/**/*.json'], { base: "." })
        .pipe(ts({
            "module": "commonjs",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": false,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5",
            "noImplicitAny": false
            }))
        .pipe(gulp.dest(outDir));
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
            getDefinition("https://raw.githubusercontent.com/MKHenson/users/dev/dist/definitions/definitions.d.ts", "src/definitions/required/", "webinate-users.d.ts")
         ]);
});

// Builds each of the ts files into JS files in the output folder
gulp.task('ts-code-definitions', function() {

    return gulp.src(['src/definitions/custom/modepress-api.d.ts'], { base: "src/definitions/custom/" })
        .pipe(gulp.dest(outDir + "/definitions"));
});

gulp.task('build-all', ['ts-code', 'ts-code-definitions']);