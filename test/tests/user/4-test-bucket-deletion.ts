import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IBucketEntry } from 'modepress';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string;

describe( '4. Testing bucket deletion', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    bucket = json._id;
  } )

  it( 'regular user did not delete a bucket that does not exist', async function() {
    const resp = await user1.delete( `/buckets/123456789012345678901234` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'A bucket with that ID does not exist' )
  } )

  it( 'regular user did not delete a bucket that does not have a valid id', async function() {
    const resp = await user1.delete( `/buckets/badID` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'Please use a valid object id' )
  } )

  it( 'regular user has 1 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json: Page<IBucketEntry> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user has 0 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json: Page<IBucketEntry> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 0 );
  } )
} )