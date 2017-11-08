const test = require( 'unit.js' );
let guest, admin, config, user1, user2, agent, numUsers,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '20. Testing users logout', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( `did remove any existing user ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( `did create & login regular user ${testUserName} with valid details`, async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    const header = require( '../header.js' );
    const newAgent = await header.createUser( testUserName, 'password', testUserEmail );
    agent = newAgent;
  } )

  it( 'user should be logged in', async function() {
    const resp = await agent.get( '/api/auth/authenticated' );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.authenticated ).isTrue();
  } )

  it( 'should log out', async function() {
    const resp = await agent.get( `/api/auth/logout` );
    test.number( resp.status ).is( 200 );
  } )

  it( 'user should be logged out', async function() {
    const resp = await agent.get( '/api/auth/authenticated' );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.authenticated ).isFalse();
  } )

  it( 'did allow the regular user to delete its own account', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    test.number( resp.status ).is( 204 );
  } )
} )