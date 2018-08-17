import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';
import { Page, IVolume, IFileEntry } from '../../../src';
import * as FormData from 'form-data';
import * as fs from 'fs';

let volume: IVolume<'client'>;
let fileA: IFileEntry<'client'>;
let fileB: IFileEntry<'client'>;
let fileC: IFileEntry<'client'>;

describe( 'Testing volume get requests', function() {

  before( async function() {
    let resp = await header.user1.post( `/volumes`, { name: 'aaa' } as IVolume<'client'> );
    let json = await resp.json<IVolume<'client'>>();
    assert.deepEqual( resp.status, 200 );
    volume = json;

    // Upload files
    let form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/img-a.png' ) );
    resp = await header.user1.post( `/files/volumes/${volume._id}/upload`, form, form.getHeaders() );
    fileA = ( await resp.json<IFileEntry<'client'>>() )[ 0 ];
    assert.equal( resp.status, 200 );

    form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/img-b.png' ) );
    resp = await header.user1.post( `/files/volumes/${volume._id}/upload`, form, form.getHeaders() );
    fileB = ( await resp.json<IFileEntry<'client'>>() )[ 0 ];
    assert.equal( resp.status, 200 );

    form = new FormData();
    form.append( 'good-file', fs.createReadStream( './test/media/img-c.png' ) );
    resp = await header.user1.post( `/files/volumes/${volume._id}/upload`, form, form.getHeaders() );
    fileC = ( await resp.json<IFileEntry<'client'>>() )[ 0 ];
    assert.equal( resp.status, 200 );

  } )

  after( async function() {
    let resp = await header.user1.delete( `/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'filters by creation date by default', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert.deepEqual( resp.status, 200 );
    assert( json.data.length === 3 );

    assert( json.data[ 0 ]._id === fileA._id );
    assert( json.data[ 2 ]._id === fileC._id );
  } )

  it( 'can filter by name [asc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=name&sortOrder=asc` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert( json.data[ 0 ]._id === fileA._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileC._id );
  } )

  it( 'can filter by name [desc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=name&sortOrder=desc` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert( json.data[ 0 ]._id === fileC._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileA._id );
  } )

  it( 'can filter by creation date [asc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=created&sortOrder=asc` );
    const json = await resp.json<Page<IVolume<'client'>>>();
    assert( json.data[ 0 ]._id === fileA._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileC._id );
  } )

  it( 'can filter by creation date [desc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=created&sortOrder=desc` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert( json.data[ 0 ]._id === fileC._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileA._id );
  } )

  it( 'can filter by memory used [asc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=memory&sortOrder=asc` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert( json.data[ 0 ]._id === fileA._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileC._id );
  } )

  it( 'can filter by memory used [desc]', async function() {
    const resp = await header.user1.get( `/files/volumes/${volume._id}?sort=memory&sortOrder=desc` );
    const json = await resp.json<Page<IFileEntry<'client'>>>();
    assert( json.data[ 0 ]._id === fileC._id );
    assert( json.data[ 1 ]._id === fileB._id );
    assert( json.data[ 2 ]._id === fileA._id );
  } )
} )