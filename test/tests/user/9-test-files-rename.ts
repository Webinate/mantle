import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string, fileId: string;
const filePath = './test/media/file.png';

describe( '9. Testing file renaming', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.guest;
    admin = header.admin;
    user1 = header.user1;
    user2 = header.user2;
    config = header.config;
  } )

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    bucket = json._id;
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'uploaded file has the name "file.png"', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    fileId = json.data[ 0 ]._id;
    assert.deepEqual( json.data[ 0 ].name, "small-image.png" );
  } )

  it( 'regular user did not rename an incorrect file to testy', async function() {
    const resp = await user1.put( `/files/123`, { name: "testy" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'regular user regular user did not rename a correct file with an empty name', async function() {
    const resp = await user1.put( `/files/${fileId}`, { name: "" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "The character length of name is too short, please keep it above 3" );
  } )

  it( 'regular user did rename a correct file to testy', async function() {
    const resp = await user1.put( `/files/${fileId}`, { name: "testy" } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json._id );
    assert.deepEqual( json.name, 'testy' );
    assert.deepEqual( json.user, user1.username );
  } )

  it( 'regular user cannot set readonly attributes', async function() {
    const resp = await user1.put( `/files/${fileId}`, {
      user: 'badvalue',
      bucketId: 'badvalue',
      bucketName: 'badvalue',
      publicURL: 'badvalue',
      mimeType: 'badvalue',
      parentFile: '123456789012345678901234',
      size: 20
    } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.notDeepEqual( json.user, 'badvalue' );
    assert.notDeepEqual( json.bucketId, 'badvalue' );
    assert.notDeepEqual( json.bucketName, 'badvalue' );
    assert.notDeepEqual( json.publicURL, 'badvalue' );
    assert.notDeepEqual( json.mimeType, 'badvalue' );
    assert.notDeepEqual( json.parentFile, 'badvalue' );
    assert( json.size !== 20 );
  } )

  it( 'did rename the file to "testy" as reflected in the GET', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json.data[ 0 ].name, "testy" );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )