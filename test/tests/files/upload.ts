import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let bucket: string;
const filePath = './test/media/file.png';

describe( 'Testing file uploads', function() {

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await header.user1.post( `/buckets/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    bucket = json._id;
  } )

  it( 'regular user has 0 files in the bucket', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/buckets/${bucket}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.data.length === 0 );
  } )

  it( 'regular user did not upload a file to a bucket that does not exist', async function() {

    const form = new FormData();
    form.append( '"�$^&&', fs.readFileSync( filePath ) );
    const resp = await header.user1.post( "/buckets/dinosaurs3/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens )
    assert.deepEqual( json.message, "No bucket exists with the name 'dinosaurs3'" );
    assert( json.tokens.length === 0 );
  } )

  it( 'regular user did not upload a file when the meta was invalid', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    form.append( 'meta', 'BAD META' )
    const resp = await header.user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens )
    assert.deepEqual( json.message, "Error: Meta data is not a valid JSON: SyntaxError: Unexpected token B in JSON at position 0" );
    assert( json.tokens.length === 0 );
  } )

  it( 'regular user did upload a file when the meta was valid', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    form.append( 'meta', '{ "meta" : "good" }' )
    const resp = await header.user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens )
    assert.deepEqual( json.message, "Upload complete. [1] Files have been saved." );
    assert( json.tokens.length === 1 );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await header.user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.tokens );
    assert.deepEqual( json.message, "Upload complete. [1] Files have been saved." );
    assert( json.tokens.length === 1 )
    assert.deepEqual( json.tokens[ 0 ].field, "small-image.png" );
    assert.deepEqual( json.tokens[ 0 ].filename, "small-image.png" );
    assert( json.tokens[ 0 ].error === false )
    assert.deepEqual( json.tokens[ 0 ].errorMsg, "" );
    assert( json.tokens[ 0 ].file )
  } )

  it( 'regular user uploaded 2 files, the second with meta', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/buckets/${bucket}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.data )
    assert( json.data.length === 2 )
    assert( json.data[ 0 ].meta );
    assert.deepEqual( json.data[ 0 ].meta.meta, "good" );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await header.user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )