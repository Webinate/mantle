import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IBucketEntry } from '../../../src';

let bucket: string;

describe( '4. Testing bucket deletion', function() {

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    bucket = json._id;
  } )

  it( 'regular user did not delete a bucket that does not exist', async function() {
    const resp = await header.user1.delete( `/buckets/123456789012345678901234` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'A bucket with that ID does not exist' )
  } )

  it( 'regular user did not delete a bucket that does not have a valid id', async function() {
    const resp = await header.user1.delete( `/buckets/badID` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'Please use a valid object id' )
  } )

  it( 'regular user has 1 bucket', async function() {
    const resp = await header.user1.get( `/buckets/user/${header.user1.username}` );
    const json: Page<IBucketEntry<'client'>> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await header.user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user has 0 bucket', async function() {
    const resp = await header.user1.get( `/buckets/user/${header.user1.username}` );
    const json: Page<IBucketEntry<'client'>> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 0 );
  } )
} )