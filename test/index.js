var fs = require( 'fs' );
var yargs = require( 'yargs' );
var args = yargs.argv;

if ( !args.config || !fs.existsSync( args.config ) ) {
  console.log( "Please specify a modepress --config file to use in the command line" );
  process.exit();
}

const startup = require( '../../../dist/core/initialization/startup.js' );
const utils = require( './utils.js' );

describe( 'Initialize Server', function() {

  // Initialize the server
  before( async function() {
    await startup.initialize();
    await utils.initialize();
  } )

  it( 'should be initialized', function( done ) {
    return done();
  } );
} );

require( './login/1-login-validation' );
require( './login/2-register-validation' );
require( './login/3-login-failures' );
require( './login/4-reset-failures' );
require( './login/5-register-failures' );
require( './login/6-successful-login-logout' );