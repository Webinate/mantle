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
    test.string( json._id )
    test.string( json.email ).is( user1.email )
    test.number( json.lastLoggedIn ).isNotNaN()
    test.value( json.password )
    test.value( json.registerKey )
    test.value( json.sessionId )
    test.value( json.passwordTag )
    test.string( json.avatar ).isNot( '' )
    test.string( json.username ).is( user1.username )
    test.number( json.privileges ).is( 3 );
  } )

  it( 'did get user page information', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).isGreaterThan( 0 )
    test.number( json.index ).is( 0 )
    test.number( json.limit ).is( 10 )
  } )

  it( 'did get client driven page information from the URL', async function() {
    const resp = await admin.get( `/api/users?limit=20&index=1` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.index ).is( 1 );
    test.number( json.limit ).is( 20 );
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.data.length === numUsers ).isTrue();
  } )
} )