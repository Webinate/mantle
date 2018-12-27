import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IDraft } from '../../../src/types/models/i-draft';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  curDraft: IDraft<'client'>,
  user1: IUserEntry<'client'>;

describe( 'Testing the adding of document elements: ', function() {

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
    curDraft = document.currentDraft as IDraft<'client'>;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did not add an element with a bad document id', async function() {
    const resp = await header.guest.post( `/api/documents/bad/elements`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not add an element on a document that doesnt exist', async function() {
    const resp = await header.user1.post( `/api/documents/123456789012345678901234/elements`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not allow a guest to add an element', async function() {
    const resp = await header.guest.post( `/api/documents/${document._id}/elements`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not allow another user to add an element', async function() {
    const resp = await header.user2.post( `/api/documents/${document._id}/elements`, {} as IDraftElement<'client'> );
    assert.equal( resp.status, 403 );
  } )

  it( 'did not allow the creation of element without a type', async function() {
    const html = '<p>Hello world</p>';
    const resp = await header.user1.post( `/api/documents/${document._id}/elements`, { html: html } as IDraftElement<'client'> );
    assert.equal( resp.status, 400 );
    assert.equal( decodeURIComponent( resp.statusText ), 'You must specify an element type' );
  } )

  it( 'did not allow the creation of element without a valid type', async function() {
    const html = '<p>Hello world</p>';
    const resp = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'BAD' as any, html: html } as IDraftElement<'client'> );
    assert.equal( resp.status, 400 );
    assert.equal( decodeURIComponent( resp.statusText ), 'Type not recognised' );
  } )

  it( 'did create a regular element', async function() {
    const html = '<p>Hello world</p>';
    const resp = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-paragraph', html: html, zone: 'zone-a' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.type, 'elm-paragraph' );
    assert.deepEqual( updated.zone, 'zone-a' );
    assert.deepEqual( updated.html, html );
  } )

  it( 'did allow an admin to create a regular element', async function() {
    const html = '<p>Hello world 2</p>';
    const resp = await header.admin.post( `/api/documents/${document._id}/elements`, { type: 'elm-paragraph', html: html, zone: 'zone-a' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.type, 'elm-paragraph' );
    assert.deepEqual( updated.zone, 'zone-a' );
    assert.deepEqual( updated.html, html );
  } )

  it( 'did update the draft html', async function() {
    const resp = await header.user1.get( `/api/documents/${document._id}` );
    assert.equal( resp.status, 200 );
    const docJson = await resp.json<IDocument<'client'>>();
    const draftJson = docJson.currentDraft as IDraft<'client'>;

    assert.deepEqual( draftJson.html[ 'main' ], '<p></p>' );
    assert.deepEqual( draftJson.html[ 'zone-a' ], '<p>Hello world</p><p>Hello world 2</p>' );
  } )
} )