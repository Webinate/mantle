var gulp = require( 'gulp' );
var ts = require( 'gulp-typescript' );
var tslint = require( 'gulp-tslint' );
var download = require( 'gulp-download' );
var rename = require( "gulp-rename" );

// CONFIG
// ==============================
const tsProject = ts.createProject( 'tsconfig.json' );


// Builds each of the ts files into JS files in the output folder
gulp.task( 'ts-code', function() {
    var tsResult = tsProject.src()
        .pipe( tsProject() );

    return tsResult.js.pipe( gulp.dest( './dist' ) );
});

/**
 * Ensures the code quality is up to scratch
 */
gulp.task( 'tslint', [ 'ts-code' ], function() {
    return tsProject.src()
        .pipe( tslint( {
            configuration: 'tslint.json',
            formatter: 'verbose'
        }) )
        .pipe( tslint.report( {
            emitError: false
        }) )
});

/**
 * This function downloads a definition file from github and writes it to a destination
 * @param {string} url The url of the file to download
 * @param {string} dest The destination folder to move the file to
 */
function getDefinition( url, dest, name ) {
    return new Promise( function( resolve, reject ) {
        download( url )
            .pipe( rename( name ) )
            .pipe( gulp.dest( dest ) )
            .on( 'error', function( err ) {
                throw ( err )
            })
            .on( 'end', function() {
                resolve( true );
            })
    });
}

/**
 * Downloads the definition files used in the development of the application and moves them into the definitions folder
 */
gulp.task( 'install', function() {
    return Promise.all( [
        getDefinition( "https://raw.githubusercontent.com/MKHenson/users/dev/src/definitions/generated/users.d.ts", "src/definitions/required/", "users.d.ts" )
    ] );
});

// Copies the distribution files from src to the dist folder
gulp.task( 'dist-files', function() {

    return gulp.src( [ 'src/dist-src/*.json', 'src/dist-src/modepress-api/*.json' ], { base: "src/dist-src/" })
        .pipe( gulp.dest( './dist' ) );
});

// Copies the modepress definition into a definitions/generated folder
gulp.task( 'ts-code-definitions', function() {
    return gulp.src( [ 'src/definitions/custom/modepress.d.ts' ], { base: 'src/definitions/custom/' })
        .pipe( gulp.dest( './src/definitions/generated' ) );
});

gulp.task( 'build', [ 'ts-code', 'dist-files', 'ts-code-definitions' ] );