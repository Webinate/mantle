import * as assert from 'assert';
import * as fs from 'fs';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';
import * as FormData from 'form-data';

const filePath = './test/media/file.png';
let fileId = '';
let volume = '';

describe( 'Getting and setting user media stat usage:', function() {

  before( async function() {

    // Reset user 1
    await header.createUser( 'user1', 'password', 'user1@test.com' );

    // Create the volume
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volume = json._id;
  } )

  it( 'new user with 1 volume has minimal user stats', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.apiCallsUsed, 1 );
    assert.deepEqual( json.memoryUsed, 0 );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens )
    assert.deepEqual( json.message, "Upload complete. [1] Files have been saved." );
    assert( json.tokens.length === 1 )
    assert.deepEqual( json.tokens[ 0 ].field, "small-image.png" );
    assert.deepEqual( json.tokens[ 0 ].file, "small-image.png" );
    assert( json.tokens[ 0 ].error === false )
    assert.deepEqual( json.tokens[ 0 ].errorMsg, "" );
    assert( json.tokens[ 0 ].file );
  } )

  it( 'regular user updated its stats with the upload accordingly', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.apiCallsUsed, 2 );
    assert.deepEqual( json.memoryUsed, 228 );
  } )

  it( 'regular user did upload another file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens );
    assert.deepEqual( json.message, "Upload complete. [1] Files have been saved." );
    assert( json.tokens.length === 1 )
    assert.deepEqual( json.tokens[ 0 ].field, "small-image.png" );
    assert.deepEqual( json.tokens[ 0 ].file, "small-image.png" );
    assert( json.tokens[ 0 ].error === false )
    assert.deepEqual( json.tokens[ 0 ].errorMsg, "" );
    assert( json.tokens[ 0 ].file )
  } )

  it( 'regular user did update the api calls & memory used', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.apiCallsUsed, 3 );
    assert.deepEqual( json.memoryUsed, 228 * 2 );
  } )

  it( 'regular user fetched the uploaded file Id of the dinosaur volume', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    fileId = json.data[ 1 ]._id;
  } )

  it( 'regular user deleted the uploaded file', async function() {
    const resp = await header.user1.delete( `/files/${fileId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user stats should have full memory and an api count of 4', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.apiCallsUsed, 4 );
    assert.deepEqual( json.memoryUsed, 228 );
  } )

  it( 'regular user uploaded another file to dinosaurs & then deleted volume', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    let resp = await header.user1.post( "/volumes/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );

    resp = await header.user1.delete( `/volumes/${volume}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user stats should have full memory and an api of 6', async function() {
    const resp = await header.user1.get( `/stats/users/${header.user1.username}/get-stats` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.apiCallsUsed, 8 );
    assert.deepEqual( json.memoryUsed, 0 );
  } )
} )