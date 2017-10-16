const gulp = require( 'gulp' );
const sass = require( 'gulp-sass' );
var tslint = require( 'gulp-tslint' );
const webpack = require( 'webpack' );
const ts = require( "gulp-typescript" );
const tsProject = ts.createProject( 'tsconfig-server.json', { noImplicitAny: true } );
const tsLintProj = ts.createProject( 'tsconfig-lint.json' );

function buildStatics() {
  return gulp.src( './src/static/**/*' )
    .pipe( gulp.dest( './dist/client/' ) );
};

function buildClient( callback ) {
  webpack( require( './webpack.config.js' ), function( err, stats ) {
    if ( err )
      throw err;

    callback();
  } );
}

function buildServer() {
  let didError = false;
  const tsResult = tsProject.src()
    .pipe( tsProject() )

    .on( 'error', function( error ) {
      didError = true;
    } )

  return tsResult.js.pipe( gulp.dest( './dist/server' ) )
    .on( 'end', function() {
      if ( didError )
        throw new Error( 'There were build errors' );
    } )
}

function updateModepressDef() {
  return gulp.src( '../modepress-api.d.ts' )
    .pipe( gulp.dest( './src/types' ) );
}

function buildSass() {
  return gulp.src( './src/main.scss' )
    .pipe( sass().on( 'error', sass.logError ) )
    .pipe( gulp.dest( './dist/client/css' ) );
}

function lint() {
  return tsLintProj.src()
    .pipe( tslint( {
      configuration: 'tslint.json',
      formatter: 'verbose'
    } ) )
    .pipe( tslint.report( {
      emitError: true
    } ) )
}

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.buildStatics = buildStatics;
exports.lint = lint;
exports.buildSass = buildSass;
exports.updateModepressDef = updateModepressDef;

const build = gulp.series( buildServer, lint, buildClient, gulp.parallel( buildSass, buildStatics ) );

gulp.task( 'update-modepress-def', updateModepressDef );
gulp.task( 'build', build );
gulp.task( 'default', build );