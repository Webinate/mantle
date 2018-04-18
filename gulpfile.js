var gulp = require( 'gulp' );
var ts = require( 'gulp-typescript' );
var tslint = require( 'gulp-tslint' );
var setup = require( './gulp/setup.js' );

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
gulp.task( 'ts-check-code', function() {
  var tsResult = tsProject.src()
    .pipe( tsProject() );

  return tsResult;
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

gulp.task( 'bump-patch', function() { return setup.bumpVersion( setup.bumpPatchNum, configFiles ) } );
gulp.task( 'bump-minor', function() { return setup.bumpVersion( setup.bumpMidNum, configFiles ) } );
gulp.task( 'bump-major', function() { return setup.bumpVersion( setup.bumpMajorNum, configFiles ) } );
gulp.task( 'build', [ 'ts-check-code', 'tslint' ] );