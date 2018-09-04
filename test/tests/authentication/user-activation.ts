import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com',
  activationKey;

describe( 'Testing user activation', function() {

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await header.admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'should register with valid information', async function() {
    const resp = await header.guest.post( `/api/auth/register`, { username: testUserName, password: "Password", email: testUserEmail } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please activate your account with the link sent to your email address" )
    assert( json.user );
  } )

  it( `did create an activation key for ${testUserName}`, async function() {
    const resp = await header.admin.get( `/api/users/${testUserName}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.registerKey !== "" );
    activationKey = json.registerKey;
  } )

  it( 'did not log in with an activation code present', async function() {
    const resp = await header.guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please authorise your account by clicking on the link that was sent to your email" )
  } )

  it( 'did not resend an activation with an invalid user', async function() {
    const resp = await header.guest.get( `/api/auth/NONUSER5/resend-activation` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "No user exists with the specified details" );
  } )

  it( 'did resend an activation email with a valid user', async function() {
    const resp = await header.guest.get( `/api/auth/${testUserName}/resend-activation` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.message, "An activation link has been sent, please check your email for further instructions" )
  } )

  it( 'did not activate the account now that the activation key has changed', async function() {
    const resp = await header.guest.get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}`, null, { redirect: 'manual' } );
    assert.deepEqual( resp.status, 302 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'text/plain; charset=utf-8' );
    assert( resp.headers.get( "location" ).indexOf( 'error' ) !== -1 )
  } )

  it( `did get the renewed activation key for ${testUserName}`, async function() {
    const resp = await header.admin.get( `/api/users/${testUserName}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    activationKey = json.registerKey;
  } )

  it( 'did not activate with an invalid username', async function() {
    const resp = await header.guest.get( `/api/auth/activate-account?user=NONUSER`, null, { redirect: 'manual' } );
    assert.deepEqual( resp.status, 302 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'text/plain; charset=utf-8' );
    assert( resp.headers.get( "location" ).indexOf( 'error' ) !== -1 )
  } )

  it( 'did not activate with an valid username and no key', async function() {
    const resp = await header.guest.get( `/api/auth/activate-account?user=${testUserName}`, null, { redirect: 'manual' } );
    assert.deepEqual( resp.status, 302 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'text/plain; charset=utf-8' );
    assert( resp.headers.get( "location" ).indexOf( 'error' ) !== -1 )
  } )

  it( 'did not activate with an valid username and invalid key', async function() {
    const resp = await header.guest.get( `/api/auth/activate-account?user=${testUserName}&key=123`, null, { redirect: 'manual' } );
    assert.deepEqual( resp.status, 302 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'text/plain; charset=utf-8' );
    assert( resp.headers.get( "location" ).indexOf( 'error' ) !== -1 )
  } )

  it( 'did activate with a valid username and key', async function() {
    const resp = await header.guest.get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}`, null, { redirect: 'manual' } );
    assert.deepEqual( resp.status, 302 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'text/plain; charset=utf-8' );
    assert( resp.headers.get( "location" ).indexOf( 'success' ) !== -1 )
  } )

  it( 'did log in with valid details and an activated account', async function() {
    const resp = await header.guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.authenticated );
  } )

  it( 'did cleanup the registered user', async function() {
    const resp = await header.admin.delete( `/api/users/${testUserName}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )