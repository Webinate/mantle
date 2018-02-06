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
const tsProjectDefs = ts.createProject( 'tsconfig.json' );

const configFiles = [
  './readme.md',
  './install-script.sh',
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
gulp.task( 'tslint', function() {
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
  return gulp.src( [ 'src/*.json' ], { base: "src/" } )
    .pipe( gulp.dest( './dist' ) );
} );

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task( 'definition', function() {
  var tsResult = gulp.src( [
    './src/**/*.d.ts',
    './src/**/*.ts',
    '!./src/main.ts'
  ] )
    .pipe( tsProjectDefs() );

  return tsResult.dts
    .pipe( gulp.dest( './dist/definitions' ) );
} );

gulp.task( 'bump-patch', function() { return setup.bumpVersion( setup.bumpPatchNum, configFiles ) } );
gulp.task( 'bump-minor', function() { return setup.bumpVersion( setup.bumpMidNum, configFiles ) } );
gulp.task( 'bump-major', function() { return setup.bumpVersion( setup.bumpMajorNum, configFiles ) } );
gulp.task( 'build', [ 'ts-code', 'tslint', 'dist-files', 'definition' ] );
gulp.task( 'quick-build', [ 'ts-code' ] );