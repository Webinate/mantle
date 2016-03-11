var gulp = require('gulp');
var fs = require('fs');
var concat = require('gulp-concat');
var ts = require('gulp-typescript');
var merge = require('merge-stream');

// CONFIG
// ==============================
var outDir = "../server/resources";
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

// Builds each of the ts files into JS files in the output folder
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

// Builds the definition
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
        .pipe(gulp.dest(outDir + "/definitions"));
});

gulp.task('build-all', ['ts-code', 'ts-code-declaration']);