var fs = require( 'fs' );
var yargs = require( "yargs" );
var args = yargs.argv;

require( "ts-node" ).register( {
  compilerOptions: {
    module: "commonjs",
    sourceMap: true,
    target: "es2017",
    isolatedModules: true
  },
} );

if ( !args.config || !fs.existsSync( args.config ) ) {
  console.log( "Please specify a modepress --config file to use in the command line" );
  process.exit();
}

if ( args.server === undefined || isNaN( parseInt( args.server ) ) ) {
  console.log( "Please specify a --server index in the cmd arguments to test. This index refers to the array item in the modepress config.servers array" );
  process.exit();
}

const startup = require( '../src/core/initialization/startup' );
const header = require( './tests/header' ).default;

// Start the first test to initialize everything
describe( 'Initializing tests', function() {

  before( async function() {
    this.timeout( 20000 );

    try {
      // Initialize the server
      await startup.initialize();

      // Initialize the test suites
      await header.initialize();
    }
    catch ( err ) {
      console.error( err );
      process.exit();
    }

    return true;
  } );

  it( 'should be initialized', function( done ) {
    return done();
  } );
} );

require( './tests/user/1-stats-basics' );
require( './tests/user/2-authenticated' );
require( './tests/user/3-bucket-creation' );
require( './tests/user/4-bucket-deletion' );
require( './tests/user/5-bucket-fetching' );
require( './tests/user/6-files-deletion' );
require( './tests/user/7-files-download' );
require( './tests/user/8-files-get' );
require( './tests/user/9-files-rename' );
require( './tests/user/10-files-set-accessibility' );
require( './tests/user/11-files-upload' );
require( './tests/user/12-get-user' );
require( './tests/user/13-log-in' );
require( './tests/user/15-stats-setting-values' );
require( './tests/user/16-user-activation' );
require( './tests/user/17-user-creation' );
require( './tests/user/18-user-deletion' );
require( './tests/user/19-user-fetching' );
require( './tests/user/20-user-logout' );
require( './tests/user/22-user-registration' );
require( './tests/user/21-user-meta' );

require( './tests/posts/1-create' );
require( './tests/posts/2-delete' );
require( './tests/posts/3-editting' );
require( './tests/posts/4-getting' );

require( './tests/comments/1-create' );
require( './tests/comments/2-delete' );
require( './tests/comments/3-fetch' );

require( './tests/categories/1-create' );