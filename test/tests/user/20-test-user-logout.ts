import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, agent: Agent, numUsers: number,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( '20. Testing users logout', function() {

  before( function() {
    const header = require( '../header' ).default;
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
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    const header = require( '../header' ).default;
    const newAgent = await header.createUser( testUserName, 'password', testUserEmail );
    agent = newAgent;
  } )

  it( 'user should be logged in', async function() {
    const resp = await agent.get( '/api/auth/authenticated' );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.authenticated );
  } )

  it( 'should log out', async function() {
    const resp = await agent.get( `/api/auth/logout` );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'user should be logged out', async function() {
    const resp = await agent.get( '/api/auth/authenticated' );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.authenticated === false )
  } )

  it( 'did allow the regular user to delete its own account', async function() {
    const resp = await admin.delete( `/api/users/${testUserName}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )