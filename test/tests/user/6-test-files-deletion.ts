import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string;
const filePath = './test/media/file.png';
let fileId;

describe( '6. Testing files deletion', function() {

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
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'regular user has 1 file', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    fileId = json.data[ 0 ]._id;
    assert( json.data.length === 1 );
  } )

  it( 'regular user did not remove a file with a bad id', async function() {
    const resp = await user1.delete( `/files/123` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 500 );
    assert.deepEqual( json.message, 'Invalid file ID format' );
  } )

  it( 'regular user did remove a file with a valid id', async function() {
    const resp = await user1.delete( `/files/${fileId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'regular user has 0 files', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 0 );
  } )

  // TODO: Add a test for regular user deletion permission denial?
  // TODO: Add a test for admin deletion of user file?

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )