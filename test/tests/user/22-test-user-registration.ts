import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '22. Testing registering a user', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.guest;
    admin = header.admin;
    user1 = header.user1;
    config = header.config;
  } )

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'should not register with blank credentials', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "", password: "" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please enter a valid username" )
  } )

  it( 'should not register with existing username', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: admin.username, password: "FakePass" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "That username or email is already in use; please choose another or login." )
  } )

  it( 'should not register with blank username', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "", password: "FakePass" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please enter a valid username" )
  } )

  it( 'should not register with blank password', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "sdfsdsdfsdfdf", password: "" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Password cannot be null or empty" )
  } )

  it( 'should not register with bad characters', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: "!\"�$%^^&&*()-=~#}{}", password: "!\"./<>;�$$%^&*()_+" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please only use alpha numeric characters for your username" )
  } )

  it( 'should not register with valid information but no email', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: testUserName, password: "Password" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Email cannot be null or empty" )
  } )

  it( 'should not register with valid information but invalid email', async function() {
    const resp = await admin.post( `/api/auth/register`, { username: testUserName, password: "Password", email: "bad_email" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please use a valid email address" )
  } )

  it( 'should register with valid information', async function() {
    const resp = await guest.post( `/api/auth/register`, { username: testUserName, password: "Password", email: testUserEmail } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Please activate your account with the link sent to your email address" )
    assert( json.user )
  } )

  it( `did create an activation key for ${testUserName}`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.registerKey !== '' )
  } )

  it( 'did not approve activation as a regular user', async function() {
    const resp = await user1.put( `/api/auth/${testUserName}/approve-activation` );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( `did allow an admin to activate ${testUserName}`, async function() {
    const resp = await admin.put( `/api/auth/${testUserName}/approve-activation` );
    assert.deepEqual( resp.status, 200 );
  } )

  it( `did approve ${testUserName}'s register key`, async function() {
    const resp = await admin.get( `/api/users/${testUserName}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.registerKey, "" );
  } )

  it( 'did cleanup the registered user', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )