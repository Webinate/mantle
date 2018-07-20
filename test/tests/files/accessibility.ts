import * as assert from 'assert';
import { } from 'mocha';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry, IVolume } from '../../../src';
import * as FormData from 'form-data';

let volume: IVolume<'client'>;
const filePath = './test/media/file.png';
let fileUrl = '';

describe( 'Testing file accessibility functions', function() {

  before( async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
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

  it( 'regular user has 1 file', async function() {
    const resp = await header.user1.get( `/files/users/${header.user1.username}/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    fileUrl = json.data[ 0 ].publicURL;
    assert( json.data.length === 1 );
  } )

  it( 'did download the file off the volume', async function() {
    const agent = header.createAgent( fileUrl );
    const resp = await agent.get( '' );
    assert.deepEqual( resp.status, 200 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'image/png' );
  } )
} )