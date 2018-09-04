import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';

let numUsers: number;

describe( 'Testing fetching users', function() {

  it( 'did get the number of users before the tests begin', async function() {
    const resp = await header.admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    numUsers = json.data.length;
  } )

  it( 'did not allow a regular user to access the admin user details', async function() {
    const resp = await header.user1.get( `/api/users/${header.admin.username}?verbose=true` );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( 'did not allow a regular user to access another user details', async function() {
    const resp = await header.user2.get( `/api/users/${header.admin.username}?verbose=true` )
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( 'did get regular users own data', async function() {
    const resp = await header.user1.get( `/api/users/${header.user1.username}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert.deepEqual( json.email, header.user1.email )
    assert( json.lastLoggedIn )
    assert( json.password )
    assert( json.registerKey === '' )
    assert( json.sessionId )
    assert( json.passwordTag === '' )
    assert( json.avatar !== '' )
    assert.deepEqual( json.username, header.user1.username )
    assert.deepEqual( json.privileges, 3 );
  } )

  it( 'did get user page information', async function() {
    const resp = await header.admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.count > 0 );
    assert.deepEqual( json.index, 0 )
    assert.deepEqual( json.limit, 10 )
  } )

  it( 'did get client driven page information from the URL', async function() {
    const resp = await header.admin.get( `/api/users?limit=20&index=1` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.index, 1 );
    assert.deepEqual( json.limit, 20 );
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await header.admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.data.length === numUsers );
  } )
} )