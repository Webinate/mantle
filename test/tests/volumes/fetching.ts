import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page, IVolume } from '../../../src';

let volume: string;

describe( 'Testing volume get requests', function() {

  it( 'regular user did create a volume dinosaurs', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volume = json._id;
  } )

  it( 'regular user has 1 volume', async function() {
    const resp = await header.user1.get( `/volumes/user/${header.user1.username}` );
    const json: Page<IVolume<'client'>> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
    const volume = json.data[ 0 ];
    assert( volume.hasOwnProperty( "_id" ) )
    assert.deepEqual( volume.name, 'dinosaurs' );
    assert.deepEqual( volume.user, header.user1.username );
    assert.deepEqual( volume.memoryUsed, 0 );
    assert( volume.created > 0 )
    assert( volume.identifier !== '' );
  } )

  it( 'regular user did not get volumes for admin', async function() {
    const resp = await header.user1.get( `/volumes/user/${( header.config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'other regular user did not get volumes for regular user', async function() {
    const resp = await header.user2.get( `/volumes/user/${( header.config.adminUser as IAdminUser ).username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );

  } )

  it( 'admin can see regular user has 1 volume', async function() {
    const resp = await header.admin.get( `/volumes/user/${header.user1.username}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 1 )
  } )

  it( 'regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete( `/volumes/${volume}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )