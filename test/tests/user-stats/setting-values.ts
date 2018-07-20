import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IStorageStats } from '../../../src';

let stats: IStorageStats<'client'>;

describe( 'Testing setting stat values', function() {

  it( 'regular did get its stat information', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json<IStorageStats<'client'>>();
    stats = json;
  } )

  it( 'regular user did not create storage calls for admin', async function() {
    const resp = await header.user1.put( `/stats/storage-calls/${( header.config.adminUser as IAdminUser ).username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage memory for admin', async function() {
    const resp = await header.user1.put( `/stats/storage-memory/${( header.config.adminUser as IAdminUser ).username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create allocated calls for admin', async function() {
    const resp = await header.user1.put( `/stats/storage-allocated-calls/${( header.config.adminUser as IAdminUser ).username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create allocated memory for admin', async function() {
    const resp = await header.user1.put( `/stats/storage-allocated-memory/${( header.config.adminUser as IAdminUser ).username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage calls for itself', async function() {
    const resp = await header.user1.put( `/stats/storage-calls/${header.user1.username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage memory for itself', async function() {
    const resp = await header.user1.put( `/stats/storage-memory/${header.user1.username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage allocated calls for itself', async function() {
    const resp = await header.user1.put( `/stats/storage-allocated-calls/${header.user1.username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage allocated memory for itself', async function() {
    const resp = await header.user1.put( `/stats/storage-allocated-memory/${header.user1.username}/90000`, {} );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'did not update the regular stats', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json<IStorageStats<'client'>>();
    assert( stats.apiCallsAllocated == json.apiCallsAllocated );
    assert( stats.memoryAllocated == json.memoryAllocated );
    assert( stats.apiCallsUsed == json.apiCallsUsed );
    assert( stats.memoryUsed == json.memoryUsed );
  } )

  it( 'admin can set storage calls for a regular user to 50', async function() {
    const resp = await header.admin.put( `/stats/storage-calls/${header.user1.username}/50`, {} );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'admin can set storage memory for a regular user to 50', async function() {
    const resp = await header.admin.put( `/stats/storage-memory/${header.user1.username}/50`, {} );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'admin can set allocated storage calls for a regular user to 100', async function() {
    const resp = await header.admin.put( `/stats/storage-allocated-calls/${header.user1.username}/100`, {} );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'admin can set allocated memory for a regular user to 100', async function() {
    const resp = await header.admin.put( `/stats/storage-allocated-memory/${header.user1.username}/100`, {} );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user stats have been updated', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json<IStorageStats<'client'>>();
    assert.deepEqual( json.apiCallsAllocated, 100 );
    assert.deepEqual( json.memoryAllocated, 100 );
    assert.deepEqual( json.apiCallsUsed, 50 );
    assert.deepEqual( json.memoryUsed, 50 );
  } )

  it( 'admin setting storage back to max', async function() {
    const resp = await header.admin.put( `/stats/storage-allocated-memory/${header.user1.username}/${stats.memoryAllocated}`, {} );
    assert.deepEqual( resp.status, 200 );
  } )
} )