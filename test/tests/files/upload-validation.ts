import * as assert from 'assert';
import { } from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import header from '../header';
import { randomString } from '../utils';
import * as FormData from 'form-data';
import { IUploadResponse, IVolume } from '../../../src';

const goodFilePath = './test/media/file.png';
const dangerousFile = './test/media/dangerous.sh';
const bigFile = './test/media/big-image.bmp';
let volume: IVolume<'client'>;

describe( 'Testing volume upload validation: ', function() {

  before( async function() {
    const resp = await header.user1.post( `/volumes`, { name: randomString() } );
    const json = await resp.json<IVolume<'client'>>();
    assert.deepEqual( resp.status, 200 );
    volume = json;
  } )

  after( async function() {
    const resp = await header.user1.delete( `/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'must fail if no volume specified', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/ /upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Incorrect volume id format` );
  } )

  it( 'must fail if volume does not use a valid volume id', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/BAD_ID/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Incorrect volume id format` );
  } )

  it( 'must fail if volume does not exist', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/123456789012/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Volume does not exist` );
  } )

  it( 'must fail if another user tries to upload into your volume', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user2.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 403 );
    assert.equal( resp.statusText, `You don't have permission to make this request` );
  } )

  it( 'must fail if non-supported file is uploaded', async function() {
    const form = new FormData();
    form.append( 'dangerous', fs.createReadStream( dangerousFile ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Extension application/x-sh not supported` );
  } )

  it( 'must ignore form fields', async function() {
    const form = new FormData();
    form.append( 'some-field', 'Please ignore' );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    const data = await resp.json<IUploadResponse>();
    assert.equal( resp.status, 200 );
    assert.deepEqual( data.length, 0 );
  } )

  it( 'Must fail if files over the size limit', async function() {
    const form = new FormData();
    form.append( 'big-file', fs.createReadStream( bigFile ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `maxFileSize exceeded, received 589205 bytes of file data` );
  } )

  it( 'Must fail all uploads if even one is not accepted', async function() {
    const form = new FormData();
    form.append( 'big-file', fs.createReadStream( bigFile ) );
    form.append( 'good-file', fs.createReadStream( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );

    let filesInTemp = 0;

    fs.readdirSync( path.resolve( __dirname + '/../../../temp' ) ).forEach( file => {
      filesInTemp++;
    } );

    // There are 2 files expected in the temp - the .gitignore and readme.md - but thats it
    assert.equal( filesInTemp, 2 );
  } )
} )