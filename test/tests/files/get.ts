import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let volume: string;
const filePath = './test/media/file.png';

describe( 'Getting uploaded user files', function() {

  it( 'regular user did create a volume dinosaurs', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volume = json._id;
  } )

  it( 'regular user did not get files for the admin user volume', async function() {
    const resp = await header.user1.get( `/files/users/${( header.config.adminUser as IAdminUser ).username}/volumes/BAD_ENTRY` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not get files for a volume with bad id', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/test` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Please use a valid identifier for volumeId" );
  } )

  it( 'regular user did not get files for a non existant volume', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/123456789012345678901234` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Could not find the volume resource" );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user did upload another file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user fetched 2 files from the dinosaur volume', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 )
    assert.deepEqual( json.data[ 0 ].numDownloads, 0 );
    assert.deepEqual( json.data[ 0 ].size, 228 );
    assert.deepEqual( json.data[ 0 ].mimeType, "image/png" );
    assert.deepEqual( json.data[ 0 ].user, header.user1.username );
    assert( json.data[ 0 ].publicURL )
    assert( json.data[ 0 ].isPublic )
    assert( json.data[ 0 ].identifier )
    assert( json.data[ 0 ].volumeId )
    assert( json.data[ 0 ].created )
    assert.deepEqual( json.data[ 0 ].volumeName, "dinosaurs" );
    assert( json.data[ 0 ]._id )
  } )

  it( 'admin fetched 2 files from the regular users dinosaur volume', async function() {
    const resp = await header.admin.get( `/files/users/${header.user1.username}/volumes/${volume}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 );
  } )

  it( 'regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete( `/volumes/${volume}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )