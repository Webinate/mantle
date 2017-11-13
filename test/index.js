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

const startup = require( '../dist/core/initialization/startup.js' );
const header = require( './tests/header.js' );

// Start the first test to initialize everything
describe( 'Initializing tests', function() {

  before( async function() {
    this.timeout( 20000 );

    try {
      // Initialize the server
      await startup.initialize();
    }
    catch ( err ) {
      console.error( err );
      process.exit();
    }

    // Initialize the test suites
    await header.initialize();
  } );

  it( 'should be initialized', function( done ) {
    return done();
  } );
} );

require( './tests/user/1-test-stats-basics' );
require( './tests/user/2-test-authenticated.js' );
require( './tests/user/3-test-bucket-creation' );
require( './tests/user/4-test-bucket-deletion' );
require( './tests/user/5-test-bucket-fetching' );
require( './tests/user/6-test-files-deletion' );
require( './tests/user/7-test-files-download' );
require( './tests/user/8-test-files-get' );
require( './tests/user/9-test-files-rename' );
require( './tests/user/10-test-files-set-accessibility' );
require( './tests/user/11-test-files-upload' );
require( './tests/user/12-test-get-user' );
require( './tests/user/13-test-log-in.js' );
require( './tests/user/15-test-stats-setting-values' );
require( './tests/user/16-test-user-activation' );
require( './tests/user/17-test-user-creation' );
require( './tests/user/18-test-user-deletion' );
require( './tests/user/19-test-user-fetching' );
require( './tests/user/20-test-user-logout' );
require( './tests/user/22-test-user-registration' );
require( './tests/user/21-test-user-meta' );

require( './tests/posts/1-test-create-post' );
require( './tests/posts/2-test-delete-post' );
require( './tests/posts/3-test-editting-posts' );
require( './tests/posts/4-test-getting-posts' );

require( './tests/comments/1-test-create-comment' );
require( './tests/comments/2-test-delete-comment' );
require( './tests/comments/3-test-fetch-comment' );