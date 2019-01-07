import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IDraft } from '../../../src/types/models/i-draft';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  curDraft: IDraft<'expanded'>,
  user1: IUserEntry<'expanded'>;

describe( 'Testing the editting of document elements: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } ) as IUserEntry<'expanded'>;

    // Create post and comments
    post = await posts.create( {
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } ) as IPost<'expanded'>;

    document = post.document;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did not update an element with a bad document id', async function() {
    const resp = await header.guest.put( `/api/documents/bad/elements/bad`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not update an element with a bad element id', async function() {
    const resp = await header.guest.put( `/api/documents/123456789012345678901234/elements/bad`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not update an element on a document that doesnt exist', async function() {
    const resp = await header.user1.put( `/api/documents/123456789012345678901234/elements/123456789012345678901234`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not update an element on a document that doesnt exist', async function() {
    const resp = await header.user1.put( `/api/documents/${document._id}/elements/123456789012345678901234`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not allow a guest to edit an element', async function() {
    const resp = await header.guest.put( `/api/documents/${document._id}/elements/${document.elements[ 0 ]._id}`, { html: '' } as IDraftElement<'client'> );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not allow another user to edit an element', async function() {
    const resp = await header.user2.put( `/api/documents/${document._id}/elements/${document.elements[ 0 ]._id}`, {} as IDraftElement<'client'> );
    assert.equal( resp.status, 403 );
  } )

  it( 'did not allow an element type to be changed', async function() {
    const resp = await header.user1.put( `/api/documents/${document._id}/elements/${document.elements[ 0 ]._id}`, { type: 'elm-header-1' } as IDraftElement<'client'> );
    assert.equal( resp.status, 400 );
    assert.equal( decodeURIComponent( resp.statusText ), 'You cannot change an element type' );
  } )

  it( 'did allow a regular edit opertion', async function() {
    const updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
    const resp = await header.user1.put( `/api/documents/${document._id}/elements/${document.elements[ 0 ]._id}`, { html: updatedHTML, zone: 'zone-a' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.html, updatedHTML );
    assert.deepEqual( updated.zone, 'zone-a' );
  } )

  it( 'did allow an admin to edit', async function() {
    const updatedHTML = '<p>This is something else</p>';
    const resp = await header.admin.put( `/api/documents/${document._id}/elements/${document.elements[ 0 ]._id}`, { html: updatedHTML, zone: 'zone-a' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.html, updatedHTML );
    assert.deepEqual( updated.zone, 'zone-a' );
  } )

  it( 'did update the draft html', async function() {
    const resp = await header.user1.get( `/api/documents/${document._id}` );
    assert.equal( resp.status, 200 );
    const docJson = await resp.json<IDocument<'client'>>();
    const draftJson = docJson.currentDraft as IDraft<'client'>;

    assert.deepEqual( draftJson.html[ 'zone-a' ], '<p>This is something else</p>' );
  } )
} )