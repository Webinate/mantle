const test = require( 'unit.js' );
let guest, admin, config, user1,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '22. Testing registering a user', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    config = header.config;
  } )

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'should not register with blank credentials', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "", password: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Please enter a valid username" )
  } )

  it( 'should not register with existing username', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: admin.username, password: "FakePass" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "That username or email is already in use; please choose another or login." )
  } )

  it( 'should not register with blank username', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "", password: "FakePass" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Please enter a valid username" )
  } )

  it( 'should not register with blank password', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "sdfsdsdfsdfdf", password: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Password cannot be null or empty" )
  } )

  it( 'should not register with bad characters', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "!\"�$%^^&&*()-=~#}{}", password: "!\"./<>;�$$%^&*()_+" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Please only use alpha numeric characters for your username" )
  } )

  it( 'should not register with valid information but no email', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: testUserName, password: "Password" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Email cannot be null or empty" )
  } )

  it( 'should not register with valid information but invalid email', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: testUserName, password: "Password", email: "bad_email" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Please use a valid email address" )
  } )

  it( 'should register with valid information', async function() {
    const resp = await guest.post( `/api/auth/register`, { username: testUserName, password: "Password", email: testUserEmail } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( "Please activate your account with the link sent to your email address" )
    test.object( json.user )
  } )

  it( `did create an activation key for ${testUserName}`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "registerKey" )
    test.string( json.registerKey ).isNot( "" );
  } )

  it( 'did not approve activation as a regular user', async function() {
    const resp = await user1.put( `/api/auth/${testUserName}/approve-activation` );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.string( json.message ).is( "You don't have permission to make this request" )
  } )

  it( `did allow an admin to activate ${testUserName}`, async function() {
    const resp = await admin.put( `/api/auth/${testUserName}/approve-activation` );
    test.number( resp.status ).is( 200 );
  } )

  it( `did approve ${testUserName}'s register key`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "registerKey" )
    test.string( json.registerKey ).is( "" );
  } )

  it( 'did cleanup the registered user', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    test.number( resp.status ).is( 204 );
  } )
} )