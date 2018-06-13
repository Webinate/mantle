import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, IStorageStats } from '../../../src';

describe( 'Getting and setting user stats', function() {

  before( async function() {
    // Reset user 1
    await header.createUser( 'user1', 'password', 'user1@test.com' );
  } )

  it( 'regular user did not get stats for admin', async function() {
    const resp = await header.user1.get( `/stats/users/${( header.config.adminUser as IAdminUser ).username}/get-stats` );
    const json = await resp.json();
    assert.strictEqual( resp.status, 403 );
    assert( json.message );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create stats for admin', async function() {
    const resp = await header.user1.post( `/stats/create-stats/${( header.config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.strictEqual( resp.status, 403 );
    assert( json.message );
    assert( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did get default stats for itself', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    const json: IStorageStats<'client'> = await resp.json();
    assert.strictEqual( resp.status, 200 );

    assert( json );
    assert( json._id );
    assert.equal( json.user, header.user1.username );
    assert.equal( json.apiCallsAllocated, 20000 );
    assert.equal( json.memoryAllocated, 500000000 );
    assert.equal( json.apiCallsUsed, 0 );
    assert.equal( json.memoryUsed, 0 );
  } )
} )