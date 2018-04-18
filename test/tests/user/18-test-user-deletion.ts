import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, agent: Agent, numUsers: number,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '18. Testing deleting users', function() {

  before( function() {
    const header = require( '../header' ).default;
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
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    numUsers = json.data.length;
  } )

  it( 'did not allow a regular user to remove another user', async function() {
    const resp = await user1.delete( `/api/users/${user2.username}` )
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" )
  } )

  it( `did create & login regular user ${testUserName} with valid details`, async function() {
    const resp = await admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();

    const header = require( '../header' ).default;
    const newAgent = await header.createUser( testUserName, 'password', testUserEmail );

    agent = newAgent;
  } )

  it( 'did allow the regular user to delete its own account', async function() {
    const resp = await agent.delete( `/api/users/${testUserName}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did have the same number of users as before the tests started', async function() {
    const resp = await admin.get( `/api/users` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.data.length === numUsers );
  } )
} )