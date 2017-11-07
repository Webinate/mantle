const test = require( 'unit.js' );
let guest, admin, config, user1, user2, agent, numUsers,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '18. Testing deleting users', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( `did removing any existing user ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'did get the number of users', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.length )
    numUsers = json.data.length;
  } )

  it( 'did not allow a regular user to remove another user', async function() {
    const resp = await user1.delete( `/api/users/${user2.username}` )
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You don't have permission to make this request" )
  } )

  it( `did create & login regular user ${testUserName} with valid details`, async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();

    const header = require( '../header.js' );
    const newAgent = await header.createUser( testUserName, 'password', testUserEmail );

    agent = newAgent;
  } )

  it( 'did allow the regular user to delete its own account', async function() {
    const resp = await agent.delete( `/api/users/${testUserName}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( `User ${testUserName} has been removed` )
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await admin.get( `/api/users` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.data.length === numUsers ).isTrue();
  } )
} )