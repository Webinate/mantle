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

require( './tests/authentication/authenticated' );
require( './tests/authentication/log-in' );
require( './tests/authentication/logout' );
require( './tests/authentication/registration' );
require( './tests/authentication/user-activation' );

require( './tests/volumes/creation' );
require( './tests/volumes/deletion' );
require( './tests/volumes/fetching' );

require( './tests/categories/create' );
require( './tests/categories/fetching' );
require( './tests/categories/hierarchies' );

require( './tests/comments/create' );
require( './tests/comments/delete' );
require( './tests/comments/fetch' );

require( './tests/files/accessibility' );
require( './tests/files/deletion' );
require( './tests/files/download' );
require( './tests/files/get' );
require( './tests/files/rename' );
require( './tests/files/upload' );
require( './tests/files/upload-validation' );

require( './tests/posts/create' );
require( './tests/posts/delete' );
require( './tests/posts/editting' );
require( './tests/posts/getting' );
require( './tests/posts/get-filters' );

require( './tests/user/create-user' );
require( './tests/user/delete-user' );
require( './tests/user/fetch-user-data' );
require( './tests/user/get-set-user-meta' );
require( './tests/user/get-user-data' );

require( './tests/user-stats/get-set-media-stats' );
require( './tests/user-stats/get-set-user-stats' );
require( './tests/user-stats/setting-values' );