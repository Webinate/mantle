import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from 'modepress';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, numUsers: number,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '19. Testing fetching users', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'did get the number of users before the tests begin', async function() {
    const resp = await admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    numUsers = json.data.length;
  } )

  it( 'did not allow a regular user to access the admin user details', async function() {
    const resp = await user1.get( `/api/users/${admin.username}?verbose=true` );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( 'did not allow a regular user to access another user details', async function() {
    const resp = await user2.get( `/api/users/${admin.username}?verbose=true` )
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( 'did get regular users own data', async function() {
    const resp = await user1.get( `/api/users/${user1.username}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert.deepEqual( json.email, user1.email )
    assert( json.lastLoggedIn )
    assert( json.password )
    assert( json.registerKey === '' )
    assert( json.sessionId )
    assert( json.passwordTag === '' )
    assert( json.avatar !== '' )
    assert.deepEqual( json.username, user1.username )
    assert.deepEqual( json.privileges, 3 );
  } )

  it( 'did get user page information', async function() {
    const resp = await admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.count > 0 );
    assert.deepEqual( json.index, 0 )
    assert.deepEqual( json.limit, 10 )
  } )

  it( 'did get client driven page information from the URL', async function() {
    const resp = await admin.get( `/api/users?limit=20&index=1` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.index, 1 );
    assert.deepEqual( json.limit, 20 );
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.data.length === numUsers );
  } )
} )