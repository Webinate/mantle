import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IBucketEntry } from 'modepress';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string;

describe( '5. Testing bucket get requests', function() {

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

  it( 'regular user has 1 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json: Page<IBucketEntry> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
    const bucket = json.data[ 0 ];
    assert( bucket.hasOwnProperty( "_id" ) )
    assert.deepEqual( bucket.name, 'dinosaurs' );
    assert.deepEqual( bucket.user, user1.username );
    assert.deepEqual( bucket.memoryUsed, 0 );
    assert( bucket.created > 0 )
    assert( bucket.identifier !== '' );
  } )

  it( 'regular user did not get buckets for admin', async function() {
    const resp = await user1.get( `/buckets/user/${( config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'other regular user did not get buckets for regular user', async function() {
    const resp = await user2.get( `/buckets/user/${( config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );

  } )

  it( 'admin can see regular user has 1 bucket', async function() {
    const resp = await admin.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )