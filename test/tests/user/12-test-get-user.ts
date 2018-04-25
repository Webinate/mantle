import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

describe( '12. Getting user data', function() {

  it( 'should allow admin access to basic data', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert( json.email === undefined )
    assert( json.lastLoggedIn )
    assert( json.password === undefined )
    assert( json.registerKey === undefined )
    assert( json.sessionId === undefined )
    assert.deepEqual( json.username, ( header.config.adminUser as IAdminUser ).username )
    assert.deepEqual( json.privileges, 1 )
    assert( json.passwordTag === undefined )
  } )

  it( 'should allow admin access to sensitive data', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert.deepEqual( json.email, ( header.config.adminUser as IAdminUser ).email )
    assert( json.lastLoggedIn )
    assert( json.password )
    assert( json.registerKey === '' )
    assert( json.sessionId )
    assert.deepEqual( json.username, ( header.config.adminUser as IAdminUser ).username )
    assert.deepEqual( json.privileges, 1 )
    assert( json.passwordTag )
  } )

  it( 'should get admin user data by email without sensitive details', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).email}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert( json.email === undefined )
    assert( json.lastLoggedIn )
    assert( json.password === undefined )
    assert( json.registerKey === undefined )
    assert( json.sessionId === undefined )
    assert.deepEqual( json.username, ( header.config.adminUser as IAdminUser ).username )
    assert.deepEqual( json.privileges, 1 )
    assert( json.passwordTag === undefined )
  } )

  it( 'should get admin user data by email with sensitive details', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).email}?verbose=true` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id )
    assert.deepEqual( json.email, ( header.config.adminUser as IAdminUser ).email )
    assert( json.lastLoggedIn )
    assert( json.password )
    assert( json.registerKey === '' )
    assert( json.sessionId )
    assert( json.passwordTag )
    assert.deepEqual( json.username, ( header.config.adminUser as IAdminUser ).username )
    assert.deepEqual( json.privileges, 1 )
  } )

  it( 'should get no user with username', async function() {
    const resp = await header.guest.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}` );
    assert.deepEqual( resp.status, 401 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You must be logged in to make this request" )

  } ).timeout( 20000 )

  it( 'should get no user with email or verbose', async function() {
    const resp = await header.guest.get( `/api/users/${( header.config.adminUser as IAdminUser ).email}?verbose=true` );
    assert.deepEqual( resp.status, 401 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You must be logged in to make this request" )
  } ).timeout( 20000 )
} )