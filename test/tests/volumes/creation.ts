import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, IVolume, Page } from '../../../src';

let volume1: string, volume2: string;

describe( 'Testing volume creation', function() {

  it( 'regular user did not create a volume for another user', async function() {
    const resp = await header.user1.post( `/volumes/user/${( header.config.adminUser as IAdminUser ).username}/test` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create a volume with bad characters', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/�BAD!CHARS` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Please only use safe characters" );
  } )

  it( 'regular user did create a new volume called dinosaurs', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json: IVolume<'client'> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.hasOwnProperty( "_id" ) );
    assert.deepEqual( json.name, 'dinosaurs' );
    assert.deepEqual( json.type, 'local' );
    assert.deepEqual( json.user, header.user1.username );
    assert.deepEqual( json.memoryUsed, 0 );
    assert( json.created > 0 );
    assert( json.identifier !== '' );
    volume1 = json._id as string;
  } )

  it( 'regular user did not create a volume with the same name as an existing one', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "A volume with the name 'dinosaurs' has already been registered" );
  } )

  it( 'admin user did create a volume with a different name for regular user', async function() {
    const resp = await header.admin.post( `/volumes/user/${header.user1.username}/dinosaurs2` );
    const json: IVolume<'client'> = await resp.json();
    assert.deepEqual( resp.status, 200 );

    assert( json.hasOwnProperty( '_id' ) );
    assert.deepEqual( json.name, 'dinosaurs2' );
    assert.deepEqual( json.user, header.user1.username );
    volume2 = json._id as string;
  } )

  it( 'regular user should have 2 volumes', async function() {
    const resp = await header.user1.get( `/volumes/user/${header.user1.username}` );
    const json: Page<IVolume<'client'>> = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 );
  } )

  it( 'regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete( `/volumes/${volume1}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete( `/volumes/${volume2}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )