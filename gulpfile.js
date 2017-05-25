var gulp = require( 'gulp' );
var ts = require( 'gulp-typescript' );
var tslint = require( 'gulp-tslint' );
var concat = require( 'gulp-concat' );
var setup = require( './gulp/setup.js' );
const process = require( 'child_process' );
const fs = require( 'fs' );

// CONFIG
// ==============================
const tsProject = ts.createProject( 'tsconfig.json' );
const configFiles = [
    './readme.md',
    './install-script.sh',
    './src/dist-src/package.json',
    './package.json'
];

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task( 'ts-code', function() {
    var tsResult = tsProject.src()
        .pipe( tsProject() );

    return tsResult.js.pipe( gulp.dest( './dist' ) );
} );

/**
 * Ensures the code quality is up to scratch
 */
gulp.task( 'tslint', [ 'ts-code' ], function() {
    return tsProject.src()
        .pipe( tslint( {
            configuration: 'tslint.json',
            formatter: 'verbose'
        } ) )
        .pipe( tslint.report( {
            emitError: false
        } ) )
} );

/**
 * Copies the distribution files from src to the dist folder
 */
gulp.task( 'dist-files', function() {
    return gulp.src( [ 'src/dist-src/*.json', 'src/dist-src/modepress/*.json' ], { base: "src/dist-src/" } )
        .pipe( gulp.dest( './dist' ) );
} );

/**
 * Copies the modepress definition into a definitions/generated folder
 */
gulp.task( 'ts-code-definitions', function() {
    return gulp.src( [
        'src/definitions/custom/config/**/*.d.ts',
        'src/definitions/custom/misc/**/*.d.ts',
        'src/definitions/custom/models/**/*.d.ts',
        'src/definitions/custom/tokens/**/*.d.ts',
        'src/definitions/custom/exposed-functions/**/*.d.ts',
    ], { base: 'src/definitions/custom/' } )
        .pipe( concat( 'modepress.d.ts' ) )
        .pipe( gulp.dest( './src/definitions/generated' ) );
} );

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task( 'definition', function() {
    process.exec( 'npm run definition' );
} );

gulp.task( 'bump-patch', function() { return setup.bumpVersion( setup.bumpPatchNum, configFiles ) } );
gulp.task( 'bump-minor', function() { return setup.bumpVersion( setup.bumpMidNum, configFiles ) } );
gulp.task( 'bump-major', function() { return setup.bumpVersion( setup.bumpMajorNum, configFiles ) } );
gulp.task( 'build', [ 'tslint', 'dist-files', 'ts-code-definitions' ] );