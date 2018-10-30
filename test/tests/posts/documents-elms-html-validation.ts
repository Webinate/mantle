import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IPopulatedDraft } from '../../../src/types/models/i-draft';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  curDraft: IPopulatedDraft<'client'>,
  user1: IUserEntry<'client'>;

describe( 'Testing the validation of document element html: ', function() {

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

  it( 'did not allow ul in a p element', async function() {
    const html = '<p><ul>Hello world</ul></p>';
    const resp = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-paragraph', html: html } as IDraftElement<'client'> );
    assert.equal( resp.status, 500 );
  } )
} )