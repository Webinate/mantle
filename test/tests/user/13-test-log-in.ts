import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

describe( '13. Testing user logging in', function() {

  it( 'did not log in with empty credentials', async function() {
    const resp = await header.guest.post( '/api/auth/login', { username: "", password: "" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
  } )

  it( 'did not log in with bad credentials', async function() {
    const resp = await header.guest.post( '/api/auth/login', { username: "$%^\}{}\"&*[]@~�&$", password: "$%^&*�&@#`{}/\"�%\"$" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
  } )

  it( 'did not log in with false credentials', async function() {
    const resp = await header.guest.post( '/api/auth/login', { username: "GeorgeTheTwat", password: "FakePass" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
  } )

  it( 'did not log in with a valid username but invalid password', async function() {
    const resp = await header.guest.post( '/api/auth/login', { username: ( header.config.adminUser as IAdminUser ).username, password: "FakePass" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
  } )

  it( 'did log in with a valid username & valid password', async function() {
    const resp = await header.guest.post( '/api/auth/login', { username: ( header.config.adminUser as IAdminUser ).username, password: ( header.config.adminUser as IAdminUser ).password } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.authenticated );
    header.admin.updateCookie( resp );
  } )
} )