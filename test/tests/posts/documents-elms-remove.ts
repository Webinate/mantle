import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IPopulatedDraft } from '../../../src/types/models/i-draft';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  curDraft: IPopulatedDraft<'client'>,
  user1: IUserEntry<'client'>;

describe( 'Testing the deletion of document elements: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } );

    // Create post and comments
    post = await posts.create( {
      author: user1!._id,
      content: 'This is a temp post',
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } );

    document = post.document as IDocument<'client'>;
    curDraft = document.currentDraft as IPopulatedDraft<'client'>;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did not remove an element with a bad document id', async function() {
    const resp = await header.guest.delete( `/api/documents/bad/elements/bad` );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not remove an element with a bad element id', async function() {
    const resp = await header.guest.delete( `/api/documents/123456789012345678901234/elements/bad` );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not remove an element on a document that doesnt exist', async function() {
    const resp = await header.user1.delete( `/api/documents/123456789012345678901234/elements/123456789012345678901234` );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not update an element on a document that doesnt exist', async function() {
    const resp = await header.user1.delete( `/api/documents/${document._id}/elements/123456789012345678901234` );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not allow a guest to remove an element', async function() {
    const resp = await header.guest.delete( `/api/documents/${document._id}/elements/${curDraft.elements[ 0 ]._id}` );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not allow another user to remove an element', async function() {
    const resp = await header.user2.delete( `/api/documents/${document._id}/elements/${curDraft.elements[ 0 ]._id}` );
    assert.equal( resp.status, 403 );
  } )

  it( 'did allow a regular user to delete the unit', async function() {
    const resp = await header.user1.delete( `/api/documents/${document._id}/elements/${curDraft.elements[ 0 ]._id}` );
    assert.equal( resp.status, 204 );
  } )
} )