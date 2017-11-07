const test = require( 'unit.js' );
let guest, admin, config;

describe( '12. Getting user data', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'should allow admin access to basic data', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.username}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data._id )
    test.value( json.data.email ).isUndefined()
    test.number( json.data.lastLoggedIn ).isNotNaN()
    test.value( json.data.password ).isUndefined()
    test.value( json.data.registerKey ).isUndefined()
    test.value( json.data.sessionId ).isUndefined()
    test.string( json.data.username ).is( config.adminUser.username )
    test.number( json.data.privileges ).is( 1 )
    test.value( json.data.passwordTag ).isUndefined()
  } )

  it( 'should allow admin access to sensitive data', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.username}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data._id )
    test.string( json.data.email ).is( config.adminUser.email )
    test.number( json.data.lastLoggedIn ).isNotNaN()
    test.value( json.data.password )
    test.value( json.data.registerKey )
    test.value( json.data.sessionId )
    test.string( json.data.username ).is( config.adminUser.username )
    test.number( json.data.privileges ).is( 1 )
    test.value( json.data.passwordTag )
  } )

  it( 'should get admin user data by email without sensitive details', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.email}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data._id )
    test.value( json.data.email ).isUndefined()
    test.number( json.data.lastLoggedIn ).isNotNaN()
    test.value( json.data.password ).isUndefined()
    test.value( json.data.registerKey ).isUndefined()
    test.value( json.data.sessionId ).isUndefined()
    test.string( json.data.username ).is( config.adminUser.username )
    test.number( json.data.privileges ).is( 1 )
    test.value( json.data.passwordTag ).isUndefined()
  } )

  it( 'should get admin user data by email with sensitive details', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.email}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data._id )
    test.string( json.data.email ).is( config.adminUser.email )
    test.number( json.data.lastLoggedIn ).isNotNaN()
    test.value( json.data.password )
    test.value( json.data.registerKey )
    test.value( json.data.sessionId )
    test.value( json.data.passwordTag )
    test.string( json.data.username ).is( config.adminUser.username )
    test.number( json.data.privileges ).is( 1 )
  } )

  it( 'should get no user with username', async function() {
    const resp = await guest.get( `/api/users/${config.adminUser.username}` );
    test.number( resp.status ).is( 401 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You must be logged in to make this request" )

  } ).timeout( 20000 )

  it( 'should get no user with email or verbose', async function() {
    const resp = await guest.get( `/api/users/${config.adminUser.email}?verbose=true` );
    test.number( resp.status ).is( 401 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You must be logged in to make this request" )
  } ).timeout( 20000 )
} )