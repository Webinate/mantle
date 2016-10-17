var gulp = require( 'gulp' );
var ts = require( 'gulp-typescript' );
var tslint = require( 'gulp-tslint' );
var setup = require( './gulp/setup.js' );

// CONFIG
// ==============================
const tsProject = ts.createProject( 'tsconfig.json' );
const configFiles = [
    './readme.md',
    './install-script.sh',
    './test/package.json',
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
 * Downloads the definition files used in the development of the application and moves them into the definitions folder
 */
gulp.task( 'install-definitions', function() {
    return Promise.all( [
        setup.getDefinition( "https://raw.githubusercontent.com/MKHenson/users/dev/src/definitions/generated/users.d.ts", "src/definitions/required/", "users.d.ts" )
    ] );
});

/**
 * Copies the distribution files from src to the dist folder
 */
gulp.task( 'dist-files', function() {
    return gulp.src( [ 'src/dist-src/*.json', 'src/dist-src/modepress-api/*.json' ], { base: "src/dist-src/" })
        .pipe( gulp.dest( './dist' ) );
});

/**
 * Copies the modepress definition into a definitions/generated folder
 */
gulp.task( 'ts-code-definitions', function() {
    return gulp.src( [ 'src/definitions/custom/modepress.d.ts' ], { base: 'src/definitions/custom/' })
        .pipe( gulp.dest( './src/definitions/generated' ) );
});

gulp.task( 'bump-patch', function() { return setup.bumpVersion( setup.bumpPatchNum, configFiles ) });
gulp.task( 'bump-minor', function() { return setup.bumpVersion( setup.bumpMidNum, configFiles ) });
gulp.task( 'bump-major', function() { return setup.bumpVersion( setup.bumpMajorNum, configFiles ) });
gulp.task( 'install', [ 'install-definitions' ] );
gulp.task( 'build', [ 'tslint', 'dist-files', 'ts-code-definitions' ] );