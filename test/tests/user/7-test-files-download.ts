import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import * as fs from 'fs';
import { IConfig, IAdminUser, Page, IFileEntry } from '../../../src';
import * as FormData from 'form-data';

let guest: Agent, admin: Agent, config: IConfig, user1: Agent, user2: Agent, bucket: string;
const filePath = './test/media/file.png';
let fileUrl;
let fileId = '';

describe( '7. Getting and setting user media stat usage', async function() {

  before( function() {
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

    fileId = json.data[ 0 ].identifier;
    fileUrl = json.data[ 0 ].publicURL;
    assert( json.data.length === 1 )
  } )

  it( 'did download the file off the bucket', async function() {
    const agent = header.createAgent( fileUrl );
    const resp = await agent.get( '' );
    assert.deepEqual( resp.status, 200 );
    assert.deepEqual( resp.headers.get( 'content-type' ), 'image/png' );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    assert.deepEqual( resp.status, 204 );
  } )
} )