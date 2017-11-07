const test = require( 'unit.js' );
let guest, admin, config,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com',
  activationKey;

describe( '16. Testing user activation', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'should register with valid information', async function() {
    const resp = await guest.post( `/api/auth/register`, { username: testUserName, password: "Password", email: testUserEmail } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( "Please activate your account with the link sent to your email address" )
    test.object( json.user );
  } )

  it( `did create an activation key for ${testUserName}`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json.data ).hasProperty( "registerKey" )
    test.string( json.data.registerKey ).isNot( "" );
    activationKey = json.data.registerKey;
  } )

  it( 'did not log in with an activation code present', async function() {
    const resp = await guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Please authorise your account by clicking on the link that was sent to your email" )
  } )

  it( 'did not resend an activation with an invalid user', async function() {
    const resp = await guest.get( `/api/auth/NONUSER5/resend-activation` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "No user exists with the specified details" );
  } )

  it( 'did resend an activation email with a valid user', async function() {
    const resp = await guest.get( `/api/auth/${testUserName}/resend-activation` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" )
    test.string( json.message ).is( "An activation link has been sent, please check your email for further instructions" )
  } )

  it( 'did not activate the account now that the activation key has changed', async function() {
    const resp = await guest.get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}` );
    test.number( resp.status ).is( 302 );
    const json = await resp.json();
    test.string( resp.headers.get( 'content-type' ) ).is( 'text/plain' );
    test.string( res.headers[ "location" ] ).contains( "error" );
  } )

  it( `did get the renewed activation key for ${testUserName}`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    activationKey = json.data.registerKey;
  } )

  it( 'did not activate with an invalid username', async function() {
    const resp = await guest.code( 302 ).get( `/api/auth/activate-account?user=NONUSER` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( resp.headers.get( 'content-type' ) ).is( 'text/plain' );
    test.string( resp.headers.get( "location" ) ).contains( "error" );
  } )

  it( 'did not activate with an valid username and no key', async function() {
    const resp = await guest.code( 302 ).get( `/api/auth/activate-account?user=${testUserName}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( resp.headers.get( 'content-type' ) ).is( 'text/plain' );
    test.string( resp.headers.get( "location" ) ).contains( "error" );
  } )

  it( 'did not activate with an valid username and invalid key', async function() {
    const resp = await guest.code( 302 ).get( `/api/auth/activate-account?user=${testUserName}&key=123` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( resp.headers.get( 'content-type' ) ).is( 'text/plain' );
    test.string( res.headers[ "location" ] ).contains( "error" );
  } )

  it( 'did activate with a valid username and key', async function() {
    const resp = await guest.code( 302 ).get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( resp.headers.get( 'content-type' ) ).is( 'text/plain' );
    test.string( res.headers[ "location" ] ).contains( "success" );
  } )

  it( 'did log in with valid details and an activated account', async function() {
    const resp = await guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.authenticated ).isTrue();
    test.object( json ).hasProperty( "message" );
  } )

  it( 'did cleanup the registered user', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( `User ${testUserName} has been removed` )
  } )
} )