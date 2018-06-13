import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IBucketEntry } from '../../../src';

let bucket: string;

describe( 'Testing bucket get requests', function() {

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    bucket = json._id;
  } )

  it( 'regular user has 1 bucket', async function() {
    const resp = await header.user1.get( `/buckets/user/${header.user1.username}` );
    const json: Page<IBucketEntry<'client'>> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
    const bucket = json.data[ 0 ];
    assert( bucket.hasOwnProperty( "_id" ) )
    assert.deepEqual( bucket.name, 'dinosaurs' );
    assert.deepEqual( bucket.user, header.user1.username );
    assert.deepEqual( bucket.memoryUsed, 0 );
    assert( bucket.created > 0 )
    assert( bucket.identifier !== '' );
  } )

  it( 'regular user did not get buckets for admin', async function() {
    const resp = await header.user1.get( `/buckets/user/${( header.config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'other regular user did not get buckets for regular user', async function() {
    const resp = await header.user2.get( `/buckets/user/${( header.config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );

  } )

  it( 'admin can see regular user has 1 bucket', async function() {
    const resp = await header.admin.get( `/buckets/user/${header.user1.username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await header.user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )