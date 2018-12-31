import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';
import { Page, IVolume } from '../../../src';
import * as FormData from 'form-data';
import * as fs from 'fs';

let volA: IVolume<'expanded'>;
let volB: IVolume<'expanded'>;
let volC: IVolume<'expanded'>;

describe( 'Testing volume get requests', function() {

  before( async function() {
    let resp = await header.user1.post( `/volumes`, { name: 'aaa' } as IVolume<'client'> );
    let json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual( resp.status, 200 );
    volA = json;

    resp = await header.user1.post( `/volumes`, { name: 'bbb' } as IVolume<'client'> );
    json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual( resp.status, 200 );
    volB = json;

    resp = await header.user1.post( `/volumes`, { name: 'ccc' } as IVolume<'client'> );
    json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual( resp.status, 200 );
    volC = json;

    // Upload 1 file to B
    let form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/file.png' ) );
    resp = await header.user1.post( `/files/volumes/${volB._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );

    // Upload 2 files to C
    form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/file.png' ) );
    resp = await header.user1.post( `/files/volumes/${volC._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );

    form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/file.png' ) );
    resp = await header.user1.post( `/files/volumes/${volC._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );

  } )

  after( async function() {
    let resp = await header.user1.delete( `/volumes/${volA._id}` );
    assert.deepEqual( resp.status, 204 );

    resp = await header.user1.delete( `/volumes/${volB._id}` );
    assert.deepEqual( resp.status, 204 );

    resp = await header.user1.delete( `/volumes/${volC._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'filters by creation date by default', async function() {
    const resp = await header.user1.get( `/volumes` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 3 );

    assert( json.data[ 0 ]._id === volA._id );
    assert( json.data[ 2 ]._id === volC._id );
  } )

  it( 'can filter by name [asc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=name&sortOrder=asc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volA._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volC._id );
  } )

  it( 'can filter by name [desc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=name&sortOrder=desc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volC._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volA._id );
  } )

  it( 'can filter by creation date [asc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=created&sortOrder=asc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volA._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volC._id );
  } )

  it( 'can filter by creation date [desc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=created&sortOrder=desc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volC._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volA._id );
  } )

  it( 'can filter by memory used [asc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=memory&sortOrder=asc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volA._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volC._id );
  } )

  it( 'can filter by memory used [desc]', async function() {
    const resp = await header.user1.get( `/volumes?sort=memory&sortOrder=desc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === volC._id );
    assert( json.data[ 1 ]._id === volB._id );
    assert( json.data[ 2 ]._id === volA._id );
  } )
} )