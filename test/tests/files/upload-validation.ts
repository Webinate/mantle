import * as assert from 'assert';
import { } from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import header from '../header';
import { randomString } from '../utils';
import * as FormData from 'form-data';
import { IUploadResponse } from '../../../src';

const goodFilePath = './test/media/file.png';
const dangerousFile = './test/media/dangerous.sh';
const bigFile = './test/media/big-image.bmp';
let volumeName: string = randomString();
let volume: string;

describe( 'Testing volume upload validation: ', function() {

  before( async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/${volumeName}` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volume = json._id;
  } )

  after( async function() {
    const resp = await header.user1.delete( `/volumes/${volume}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'must fail if no volume specified', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/ /upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Please specify a volume for the upload` );
  } )

  it( 'must fail if volume does not exist', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/THIS_DOES_NOT_EXIST/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Volume does not exist` );
  } )

  it( 'must fail if non-supported file is uploaded', async function() {
    const form = new FormData();
    form.append( 'dangerous', fs.createReadStream( dangerousFile ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volumeName}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Extension application/x-sh not supported` );
  } )

  it( 'must ignore form fields', async function() {
    const form = new FormData();
    form.append( 'some-field', 'Please ignore' );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volumeName}/upload`, form, form.getHeaders() );
    const data = await resp.json<IUploadResponse>();
    assert.equal( resp.status, 200 );
    assert.deepEqual( data.files.length, 0 );
  } )

  it( 'Must fail if files over the size limit', async function() {
    const form = new FormData();
    form.append( 'big-file', fs.createReadStream( bigFile ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volumeName}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `maxFileSize exceeded, received 589219 bytes of file data` );
  } )

  it( 'Must fail all uploads if even one is not accepted', async function() {
    const form = new FormData();
    form.append( 'big-file', fs.createReadStream( bigFile ) );
    form.append( 'good-file', fs.createReadStream( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volumeName}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `maxFileSize exceeded, received 589219 bytes of file data` );

    let filesInTemp = 0;

    fs.readdirSync( path.resolve( __dirname + '/../../../temp' ) ).forEach( file => {
      filesInTemp++;
    } );

    // There are 2 files expected in the temp - the .gitignore and readme.md - but thats it
    assert.equal( filesInTemp, 2 );
  } )

  it( 'Can upload an accepted file', async function() {
    const form = new FormData();
    form.append( 'good-file', fs.createReadStream( goodFilePath ) );
    form.append( 'good-file2', fs.createReadStream( goodFilePath ) );
    const resp = await header.user1.post( `/files/users/${header.user1.username}/volumes/${volumeName}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );
  } )
} )