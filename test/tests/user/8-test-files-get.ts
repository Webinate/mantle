import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string;
const filePath = './test/media/file.png';

describe( '8. Getting uploaded user files', function() {

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

  it( 'regular user did not get files for the admin user bucket', async function() {
    const resp = await user1.get( `/files/users/${( config.adminUser as IAdminUser ).username}/buckets/BAD_ENTRY` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 403 );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not get files for a bucket with bad id', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/test` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Please use a valid identifier for bucketId" );
  } )

  it( 'regular user did not get files for a non existant bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/123456789012345678901234` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, "Could not find the bucket resource" );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user did upload another file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user fetched 2 files from the dinosaur bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 )
    assert.deepEqual( json.data[ 0 ].numDownloads, 0 );
    assert.deepEqual( json.data[ 0 ].size, 228 );
    assert.deepEqual( json.data[ 0 ].mimeType, "image/png" );
    assert.deepEqual( json.data[ 0 ].user, user1.username );
    assert( json.data[ 0 ].publicURL )
    assert( json.data[ 0 ].isPublic )
    assert( json.data[ 0 ].identifier )
    assert( json.data[ 0 ].bucketId )
    assert( json.data[ 0 ].created )
    assert.deepEqual( json.data[ 0 ].bucketName, "dinosaurs" );
    assert( json.data[ 0 ]._id )
  } )

  it( 'admin fetched 2 files from the regular users dinosaur bucket', async function() {
    const resp = await admin.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 2 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )