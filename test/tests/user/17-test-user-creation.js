const test = require( 'unit.js' );
let guest, admin, config, user1,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '17. Testing creating a user', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    config = header.config;
  } )

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'did not create a new user without a username', async function() {
    const resp = await admin.post( `/api/users`, { username: "", password: "" } );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Username cannot be empty" )
  } )

  it( 'did not create a new user without a password', async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "", email: testUserEmail } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Password cannot be empty" )
  } )

  it( 'did not create a new user with invalid characters', async function() {
    const resp = await admin.post( `/api/users`, { username: "!\"�$%^&*()", password: "password" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Username must be alphanumeric" )
  } )

  it( 'did not create a new user without email', async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Email cannot be empty" )
  } )

  it( 'did not create a new user with invalid email', async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: "gahgah" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Email must be valid" )
  } )

  it( 'did not create a new user with invalid privilege', async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 4 } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "Privilege type is unrecognised" )
  } )

  it( 'did not create a new user with an existing username', async function() {
    const resp = await admin.post( `/api/users`, { username: admin.username, password: "password", email: testUserEmail, privileges: 2 } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "A user with that name or email already exists" );
  } )

  it( 'did not create a new user with an existing email', async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: admin.email, privileges: 2 } )
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "A user with that name or email already exists" )
  } )

  it( `did not create user ${testUserName} with super admin privileges`, async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 1 } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You cannot create a user with super admin permissions" )
  } )

  it( 'did not create a new user as a regular user', async function() {
    const resp = await user1.post( `/api/users` );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "You don't have permission to make this request" )
  } )

  it( `did create regular user ${testUserName} with valid details`, async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    userId = json.data._id;
  } )

  it( 'did not create an activation key for george', async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json.data ).hasProperty( "registerKey" )
    test.string( json.data.registerKey ).is( "" );
  } )

  it( 'did cleanup the created user', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( `User ${testUserName} has been removed` )
  } )
} )