import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement, IVolume, IFileEntry, IDraft } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { IImageElement } from '../../../src/types/models/i-draft-elements';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  volume: IVolume<'client'>,
  imageElm: IImageElement<'client'>,
  user1: IUserEntry<'client'>,
  file: IFileEntry<'client'>;

describe( 'Testing the rendered html of elements: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } );

    // Create post and comments
    post = await posts.create( {
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } );

    document = post.document as IDocument<'client'>;

    const resp = await header.admin.post( `/volumes`, { name: randomString() } );
    const json = await resp.json<IVolume<'client'>>();
    assert.deepEqual( resp.status, 200 );
    volume = json;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );

    const resp = await header.admin.delete( `/volumes/${volume._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did upload a single file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append( 'good-file', fs.createReadStream( filePath ) );
    const resp = await header.admin.post( `/files/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );
    const files = await resp.json<IFileEntry<'client'>[]>();
    assert.equal( files.length, 1 );
    file = files[ 0 ];
  } )

  it( 'did add an image element and render a figure html', async function() {
    const resp = await header.admin.post( `/api/documents/${document._id}/elements`, {
      type: 'elm-image',
      image: file._id,
      zone: 'zone-a'
    } as IImageElement<'client'> );

    assert.equal( resp.status, 200 );

    imageElm = await resp.json<IImageElement<'client'>>();
    assert.deepEqual( imageElm.html, `<figure><img src="${file.publicURL}" /></figure>` );
  } )

  it( 'did get the image html from a doc request', async function() {
    const resp = await header.admin.get( `/api/documents/${document._id}` );
    const doc = await resp.json<IDocument<'client'>>();
    const draft = doc.currentDraft as IDraft<'client'>;
    assert.equal( resp.status, 200 );
    assert.equal( draft.elements[ 1 ].html, `<figure><img src="${file.publicURL}" /></figure>` );
  } )

  it( 'did remove the file from the server', async function() {
    const resp = await header.admin.delete( `/files/${file._id}` );
    assert.equal( resp.status, 204 );
  } )

  it( 'did get the render missing image html after image removed', async function() {
    const resp = await header.admin.get( `/api/documents/${document._id}` );
    const doc = await resp.json<IDocument<'client'>>();
    const draft = doc.currentDraft as IDraft<'client'>;
    assert.equal( resp.status, 200 );
    assert.equal( draft.elements[ 1 ].html, `<figure>Image not found</figure>` );
  } )

  it( 'did upload a another file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append( 'good-file', fs.createReadStream( filePath ) );
    const resp = await header.admin.post( `/files/volumes/${volume._id}/upload`, form, form.getHeaders() );
    assert.equal( resp.status, 200 );
    const files = await resp.json<IFileEntry<'client'>[]>();
    assert.equal( files.length, 1 );
    file = files[ 0 ];
  } )

  it( 'did update image the element with a new file', async function() {
    const resp = await header.admin.put( `/api/documents/${document._id}/elements/${imageElm._id}`, {
      image: file._id
    } as IImageElement<'client'> );
    assert.equal( resp.status, 200 );

    imageElm = await resp.json<IImageElement<'client'>>();
    assert.deepEqual( imageElm.html, `<figure><img src="${file.publicURL}" /></figure>` );
  } )
} )