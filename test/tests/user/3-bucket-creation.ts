import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, IBucketEntry, Page } from '../../../src';

let bucket1: string, bucket2: string;

describe( '3. Testing bucket creation', function() {

  it( 'regular user did not create a bucket for another user', async function() {
    const resp = await header.user1.post( `/buckets/user/${( header.config.adminUser as IAdminUser ).username}/test` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create a bucket with bad characters', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/�BAD!CHARS` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Please only use safe characters" );
  } )

  it( 'regular user did create a new bucket called dinosaurs', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/dinosaurs` );
    const json: IBucketEntry = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.hasOwnProperty( "_id" ) );
    assert.deepEqual( json.name, 'dinosaurs' );
    assert.deepEqual( json.user, header.user1.username );
    assert.deepEqual( json.memoryUsed, 0 );
    assert( json.created > 0 );
    assert( json.identifier !== '' );
    bucket1 = json._id as string;
  } )

  it( 'regular user did not create a bucket with the same name as an existing one', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "A Bucket with the name 'dinosaurs' has already been registered" );
  } )

  it( 'admin user did create a bucket with a different name for regular user', async function() {
    const resp = await header.admin.post( `/buckets/user/${header.user1.username}/dinosaurs2` );
    const json: IBucketEntry = await resp.json();
    assert.deepEqual( resp.status, 200 );

    assert( json.hasOwnProperty( '_id' ) );
    assert.deepEqual( json.name, 'dinosaurs2' );
    assert.deepEqual( json.user, header.user1.username );
    bucket2 = json._id as string;
  } )

  it( 'regular user should have 2 buckets', async function() {
    const resp = await header.user1.get( `/buckets/user/${header.user1.username}` );
    const json: Page<IBucketEntry> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await header.user1.delete( `/buckets/${bucket1}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await header.user1.delete( `/buckets/${bucket2}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )