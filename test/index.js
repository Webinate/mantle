var fs = require( 'fs' );
var yargs = require( "yargs" );
var args = yargs.argv;

if ( !args.config || !fs.existsSync( args.config ) ) {
    console.log( "Please specify a modepress --config file to use in the command line" );
    process.exit();
}

if ( args.server === undefined || isNaN( parseInt( args.server ) ) ) {
    console.log( "Please specify a --server index in the cmd arguments to test. This index refers to the array item in the modepress config.servers array" );
    process.exit();
}


const startup = require( '../dist/startup.js' );
const header = require( './tests/header.js' );
header.TestManager.get;

describe( 'Initializing tests', function() {

    before( function( done ) {

        startup.initialize().then(() => {
            return header.TestManager.get.initialize();
        } ).then(() => {
            done();
        } );
    } );

    it( 'should be initialized', function( done ) {
        return done();
    } );
} );

require( './tests/user/test-authenticated.js' );
require( './tests/user/test-log-in.js' );
require( './tests/user/test-get-user' );
require( './tests/user/test-user-meta' );
require( './tests/user/test-stats-basics' );
require( './tests/user/test-stats-setting-values' );
require( './tests/user/test-files-download' );
require( './tests/user/test-files-set-accessibility' );
require( './tests/user/test-bucket-creation' );
require( './tests/user/test-bucket-deletion' );
require( './tests/user/test-bucket-fetching' );
require( './tests/user/test-files-get' );
require( './tests/user/test-files-upload' );
require( './tests/user/test-files-rename' );
require( './tests/user/test-files-deletion' );
// require( './tests/users.js' );
require( './tests/posts.js' );
require( './tests/comments.js' );