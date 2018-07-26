import * as assert from 'assert';
import { } from 'mocha';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry, IVolume, IUploadResponse } from '../../../src';
import * as FormData from 'form-data';

let volume: IVolume<'client'>, fileId: string;
const filePath = './test/media/file.png';

describe( 'Testing file renaming', function() {

  before( async function() {
    const resp = await header.user1.post( `/volumes`, { name: 'dinosaurs' } );
    const json = await resp.json<IVolume<'client'>>();
    assert.deepEqual( resp.status, 200 );
    volume = json;
  } )

  after( async function() {
    const resp = await header.user1.delete( `/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'uploaded file has the name "file.png"', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    fileId = json.data[ 0 ]._id;
    assert.deepEqual( json.data[ 0 ].name, "small-image.png" );
  } )

  it( 'regular user did not rename an incorrect file to testy', async function() {
    const resp = await header.user1.put( `/files/123`, { name: "testy" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'regular user regular user did not rename a correct file with an empty name', async function() {
    const resp = await header.user1.put( `/files/${fileId}`, { name: "" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "The character length of name is too short, please keep it above 3" );
  } )

  it( 'regular user did rename a correct file to testy', async function() {
    const resp = await header.user1.put( `/files/${fileId}`, { name: "testy" } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id );
    assert.deepEqual( json.name, 'testy' );
    assert.deepEqual( json.user, header.user1.username );
  } )

  it( 'regular user cannot set readonly attributes', async function() {
    const resp = await header.user1.put( `/files/${fileId}`, {
      user: 'badvalue',
      volumetId: 'badvalue',
      volumeName: 'badvalue',
      publicURL: 'badvalue',
      mimeType: 'badvalue',
      parentFile: '123456789012345678901234',
      size: 20
    } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.notDeepEqual( json.user, 'badvalue' );
    assert.notDeepEqual( json.volumeId, 'badvalue' );
    assert.notDeepEqual( json.volumeName, 'badvalue' );
    assert.notDeepEqual( json.publicURL, 'badvalue' );
    assert.notDeepEqual( json.mimeType, 'badvalue' );
    assert.notDeepEqual( json.parentFile, 'badvalue' );
    assert( json.size !== 20 );
  } )

  it( 'did rename the file to "testy" as reflected in the GET', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.data[ 0 ].name, "testy" );
  } )
} )