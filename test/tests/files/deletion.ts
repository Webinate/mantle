import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let volume: string;
const filePath = './test/media/file.png';
let fileId;

describe( 'Testing files deletion', function() {

  it( 'regular user did create a volume dinosaurs', async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volume = json._id;
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user has 1 file', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    fileId = json.data[ 0 ]._id;
    assert( json.data.length === 1 );
  } )

  it( 'regular user did not remove a file with a bad id', async function() {
    const resp = await header.user1.delete( `/files/123` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'Invalid file ID format' );
  } )

  it( 'regular user did remove a file with a valid id', async function() {
    const resp = await header.user1.delete( `/files/${fileId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user has 0 files', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 0 );
  } )

  // TODO: Add a test for regular user deletion permission denial?
  // TODO: Add a test for admin deletion of user file?

  it( 'regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete( `/volumes/${volume}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )