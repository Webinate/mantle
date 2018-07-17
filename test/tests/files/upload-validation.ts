import * as assert from 'assert';
import { } from 'mocha';
import * as fs from 'fs';
import header from '../header';
import * as FormData from 'form-data';

const filePath = './test/media/file.png';
const dangerousFile = './test/media/dangerous.sh';
const bigFile = './test/media/big-image.bmp';

describe( 'Testing volume upload validation: ', function() {

  it( 'must fail if no volume specified', async function() {
    const form = new FormData();
    form.append( 'file', fs.readFileSync( filePath ) );
    const resp = await header.admin.post( "/volumes/ /upload2", form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Please specify a volume` );
  } )

  it( 'must fail if no non-supported file uploaded', async function() {
    const form = new FormData();
    form.append( 'file', fs.createReadStream( filePath ) );
    form.append( 'dangerous', fs.createReadStream( dangerousFile ) );
    const resp = await header.admin.post( "/volumes/hello/upload2", form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Please specify a volume` );
  } )

  it( 'Files over the size limit must fail', async function() {
    const form = new FormData();
    form.append( 'big-file', fs.createReadStream( bigFile ) );
    const resp = await header.admin.post( "/volumes/hello/upload2", form, form.getHeaders() );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `Please specify a volume` );
  } )

  it( 'Can upload an accepted file', async function() {
    const form = new FormData();
    form.append( 'regular-file', fs.createReadStream( filePath ) );
    form.append( 'regular-file2', fs.createReadStream( filePath ) );
    const resp = await header.admin.post( "/volumes/hello/upload2", form, form.getHeaders() );
    assert.equal( resp.status, 200 );
    assert.equal( resp.statusText, `Please specify a volume` );
  } )
} )