const test = require( 'unit.js' );
let guest, admin, config;

describe( '2. Checking basic authentication', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'guest should not be logged in', function( done ) {
    guest.get( '/api/auth/authenticated' )
      .then( res => {
        test.bool( res.body.authenticated ).isNotTrue();
        test.string( res.body.message ).is( "User is not authenticated" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin should be logged in', function( done ) {
    admin.get( '/api/auth/authenticated' )
      .then( res => {
        test.bool( res.body.authenticated ).isTrue();
        test.string( res.body.message ).is( "User is authenticated" );
        test.string( res.body.user._id );
        test.value( res.body.user.email ).isUndefined();
        test.number( res.body.user.lastLoggedIn ).isNotNaN();
        test.number( res.body.user.createdOn ).isNotNaN();
        test.value( res.body.user.password ).isUndefined();
        test.value( res.body.user.registerKey ).isUndefined();
        test.value( res.body.user.sessionId ).isUndefined();
        test.string( res.body.user.username ).is( config.adminUser.username );
        test.number( res.body.user.privileges ).is( 1 );
        test.value( res.body.user.passwordTag ).isUndefined();
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin should be authenticated and pass verbose details', function( done ) {
    admin.get( '/api/auth/authenticated?verbose=true' )
      .then( res => {
        test.bool( res.body.authenticated ).isTrue();
        test.string( res.body.message ).is( "User is authenticated" );
        test.string( res.body.user._id );
        test.string( res.body.user.email ).is( config.adminUser.email );
        test.number( res.body.user.lastLoggedIn ).isNotNaN();
        test.number( res.body.user.createdOn ).isNotNaN();
        test.string( res.body.user.password );
        test.string( res.body.user.registerKey );
        test.string( res.body.user.sessionId );
        test.string( res.body.user.username ).is( config.adminUser.username );
        test.number( res.body.user.privileges ).is( 1 );
        test.string( res.body.user.passwordTag );
        done();
      } ).catch( err => done( err ) );
  } )
} )