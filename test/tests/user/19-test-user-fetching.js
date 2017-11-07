const test = require( 'unit.js' );
let guest, admin, config, user1, user2, numUsers,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '19. Testing fetching users', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'did get the number of users before the tests begin', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.length )
    numUsers = json.data.length;
  } )

  it( 'did not allow a regular user to access the admin user details', async function() {
    const resp = await user1.get( `/api/users/${admin.username}?verbose=true` );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You don't have permission to make this request" )
  } )

  it( 'did not allow a regular user to access another user details', async function() {
    const resp = await user2.get( `/api/users/${admin.username}?verbose=true` )
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You don't have permission to make this request" )
  } )

  it( 'did get regular users own data', async function() {
    const resp = await user1.get( `/api/users/${user1.username}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "data" )
    test.string( json.data._id )
    test.string( json.data.email ).is( user1.email )
    test.number( json.data.lastLoggedIn ).isNotNaN()
    test.value( json.data.password )
    test.value( json.data.registerKey )
    test.value( json.data.sessionId )
    test.value( json.data.passwordTag )
    test.string( json.data.username ).is( user1.username )
    test.number( json.data.privileges ).is( 3 );
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.data.length === numUsers ).isTrue();
  } )
} )