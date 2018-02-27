const test = require( 'unit.js' );
let guest, config, admin;

describe( '13. Testing user logging in', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    config = header.config;
    admin = header.users.admin;
  } )

  it( 'did not log in with empty credentials', async function() {
    const resp = await guest.post( '/api/auth/login', { username: "", password: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
  } )

  it( 'did not log in with bad credentials', async function() {
    const resp = await guest.post( '/api/auth/login', { username: "$%^\}{}\"&*[]@~�&$", password: "$%^&*�&@#`{}/\"�%\"$" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
  } )

  it( 'did not log in with false credentials', async function() {
    const resp = await guest.post( '/api/auth/login', { username: "GeorgeTheTwat", password: "FakePass" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
  } )

  it( 'did not log in with a valid username but invalid password', async function() {
    const resp = await guest.post( '/api/auth/login', { username: config.adminUser.username, password: "FakePass" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
  } )

  it( 'did log in with a valid username & valid password', async function() {
    const resp = await guest.post( '/api/auth/login', { username: config.adminUser.username, password: config.adminUser.password } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.authenticated ).isTrue();
    test.object( json ).hasProperty( "message" );
    admin.updateCookie( resp );
  } )
} )