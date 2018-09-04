import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';
import { IUserEntry } from '../../../src';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( 'Testing creating a user', function() {

  it( `did remove any existing user called ${testUserName}`, async function() {
    const resp = await header.admin.delete( `/api/users/${testUserName}` );
  } )

  it( 'did not create a new user without a username', async function() {
    const resp = await header.admin.post( `/api/users`, { username: "", password: "" } );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Username cannot be empty" )
  } )

  it( 'did not create a new user without a password', async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "", email: testUserEmail } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Password cannot be empty" )
  } )

  it( 'did not create a new user with invalid characters', async function() {
    const resp = await header.admin.post( `/api/users`, { username: "!\"�$%^&*()", password: "password" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Username must be alphanumeric" )
  } )

  it( 'did not create a new user without email', async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Email cannot be empty" )
  } )

  it( 'did not create a new user with invalid email', async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password", email: "gahgah" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Email must be valid" )
  } )

  it( 'did not create a new user with invalid privilege', async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 4 } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Privilege type is unrecognised" )
  } )

  it( 'did not create a new user with an existing username', async function() {
    const resp = await header.admin.post( `/api/users`, { username: header.admin.username, password: "password", email: testUserEmail, privileges: 2 } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "A user with that name or email already exists" );
  } )

  it( 'did not create a new user with an existing email', async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password", email: header.admin.email, privileges: 2 } )
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "A user with that name or email already exists" )
  } )

  it( `did not create user ${testUserName} with super admin privileges`, async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 1 } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You cannot create a user with super admin permissions" )
  } )

  it( 'did not create a new user as a regular user', async function() {
    const resp = await header.user1.post( `/api/users` );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( `did create regular user ${testUserName} with valid details`, async function() {
    const resp = await header.admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } );
    const data = await resp.json<IUserEntry<'client'>>();
    assert.deepEqual( resp.status, 200 );
    assert.deepEqual( data.username, testUserName );
  } )

  it( 'did not create an activation key for george', async function() {
    const resp = await header.admin.get( `/api/users/${testUserName}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.registerKey, "" );
  } )

  it( 'did cleanup the created user', async function() {
    const resp = await header.admin.delete( `/api/users/${testUserName}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )