import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, IAuthenticationResponse } from '../../../src';

let guest: Agent, admin: Agent, config: IConfig;

describe( '2. Checking basic authentication', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'guest should not be logged in', async function() {
    const resp = await guest.get( '/api/auth/authenticated' );
    const json: IAuthenticationResponse = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.authenticated === false );
    assert.deepEqual( json.message, "User is not authenticated" );
  } )

  it( 'admin should be logged in', async function() {
    const resp = await admin.get( '/api/auth/authenticated' );
    const json: IAuthenticationResponse = await resp.json();
    assert.deepEqual( resp.status, 200 );

    assert( json.authenticated );
    assert.deepEqual( json.message, "User is authenticated" );
    assert( json.user._id );
    assert( json.user.email === undefined );
    assert( json.user.lastLoggedIn );
    assert( json.user.createdOn );
    assert( json.user.password === undefined );
    assert( json.user.registerKey === undefined );
    assert( json.user.sessionId === undefined );
    assert.deepEqual( json.user.username, ( config.adminUser as IAdminUser ).username );
    assert.deepEqual( json.user.privileges, 1 );
    assert( json.user.passwordTag === undefined );
  } )

  it( 'admin should be authenticated and pass verbose details', async function() {
    const resp = await admin.get( '/api/auth/authenticated?verbose=true' );
    const json: IAuthenticationResponse = await resp.json();
    assert.deepEqual( resp.status, 200 );

    assert( json.authenticated );
    assert.deepEqual( json.message, "User is authenticated" );
    assert( json.user._id );
    assert.deepEqual( json.user.email, ( config.adminUser as IAdminUser ).email );
    assert( json.user.lastLoggedIn );
    assert( json.user.createdOn );
    assert( json.user.password );
    assert.deepEqual( json.user.registerKey, '' );
    assert( json.user.sessionId );
    assert.deepEqual( json.user.username, ( config.adminUser as IAdminUser ).username );
    assert.deepEqual( json.user.privileges, 1 );
    assert( json.user.passwordTag );
  } )
} )