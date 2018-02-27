const test = require( 'unit.js' );
let guest, admin, config;

describe( '2. Checking basic authentication', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'guest should not be logged in', async function() {
    const resp = await guest.get( '/api/auth/authenticated' );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );

    test.bool( json.authenticated ).isNotTrue();
    test.string( json.message ).is( "User is not authenticated" );
  } )

  it( 'admin should be logged in', async function() {
    const resp = await admin.get( '/api/auth/authenticated' );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );

    test.bool( json.authenticated ).isTrue();
    test.string( json.message ).is( "User is authenticated" );
    test.string( json.user._id );
    test.value( json.user.email ).isUndefined();
    test.number( json.user.lastLoggedIn ).isNotNaN();
    test.number( json.user.createdOn ).isNotNaN();
    test.value( json.user.password ).isUndefined();
    test.value( json.user.registerKey ).isUndefined();
    test.value( json.user.sessionId ).isUndefined();
    test.string( json.user.username ).is( config.adminUser.username );
    test.number( json.user.privileges ).is( 1 );
    test.value( json.user.passwordTag ).isUndefined();
  } )

  it( 'admin should be authenticated and pass verbose details', async function() {
    const resp = await admin.get( '/api/auth/authenticated?verbose=true' );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );

    test.bool( json.authenticated ).isTrue();
    test.string( json.message ).is( "User is authenticated" );
    test.string( json.user._id );
    test.string( json.user.email ).is( config.adminUser.email );
    test.number( json.user.lastLoggedIn ).isNotNaN();
    test.number( json.user.createdOn ).isNotNaN();
    test.string( json.user.password );
    test.string( json.user.registerKey );
    test.string( json.user.sessionId );
    test.string( json.user.username ).is( config.adminUser.username );
    test.number( json.user.privileges ).is( 1 );
    test.string( json.user.passwordTag );
  } )
} )