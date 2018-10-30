import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IVolume, IFileEntry, IDocument, IUserEntry, ITemplate } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { IPopulatedDraft } from '../../../src/types/models/i-draft';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  user1: IUserEntry<'client'>;

describe( 'Testing the fetching of documents: ', function() {

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
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did get a document for a post if an admin', async function() {
    const resp = await header.admin.get( `/api/documents/${document._id}?visibility=public&sortOrder=desc&sort=created` );
    assert.equal( resp.status, 200 );
    const doc = await resp.json<IDocument<'client'>>();
    assert.deepEqual( doc._id, document._id );
    assert.deepEqual( ( doc.author as IUserEntry<'client'> )._id, user1._id );
    assert.notDeepEqual( doc.template, null );
    assert.notDeepEqual( doc.currentDraft, null );
    assert.deepEqual( typeof doc.template, 'object' );
    assert.deepEqual( typeof doc.currentDraft, 'object' );
    assert( doc.createdOn > 0 );
    assert( doc.lastUpdated > 0 );

    // Check the current draft
    const draft = doc.currentDraft as IPopulatedDraft<'client'>;
    assert.deepEqual( draft.templateMap[ ( doc.template as ITemplate<'client'> ).defaultZone ][ 0 ], draft.elements[ 0 ]._id );
    assert.deepEqual( draft.elements.length, 1 );
    assert.deepEqual( draft.elements[ 0 ].html, '<p></p>' );
    assert.deepEqual( draft.elements[ 0 ].parent, draft._id );
    assert.deepEqual( draft.elements[ 0 ].type, 'elm-paragraph' );
  } )

  it( 'did get a document for a post the author', async function() {
    const resp = await header.user1.get( `/api/documents/${document._id}` );
    assert.equal( resp.status, 200 );
    const doc = await resp.json<IDocument<'client'>>();
    assert.deepEqual( doc._id, document._id );
  } )

  it( 'did not get a document for a post when not the author', async function() {
    const resp = await header.user2.get( `/api/documents/${document._id}` );
    assert.equal( resp.status, 403 );
  } )
} )