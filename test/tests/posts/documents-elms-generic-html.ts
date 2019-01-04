import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IDraft } from '../../../src/types/models/i-draft';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  user1: IUserEntry<'expanded'>;

describe( 'Testing the adding of generic html elements: ', function() {

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

  it( 'did allow an admin to create a an element with an iframe', async function() {
    const html = '<div><iframe src="https://youtube.com"></iframe></div>';
    const resp = await header.admin.post( `/api/documents/${document._id}/elements`, { type: 'elm-html', html: html, zone: 'main' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.type, 'elm-html' );
    assert.deepEqual( updated.zone, 'main' );
    assert.deepEqual( updated.html, html );
  } )

  it( 'did allow an admin to create a an element with a script element', async function() {
    const html = '<div><script type="text/javascript" src="https://youtube.com"></script></div>';
    const resp = await header.admin.post( `/api/documents/${document._id}/elements`, { type: 'elm-html', html: html, zone: 'main' } as IDraftElement<'client'> );
    assert.equal( resp.status, 200 );
    const updated = await resp.json<IDraftElement<'client'>>();
    assert.deepEqual( updated.type, 'elm-html' );
    assert.deepEqual( updated.zone, 'main' );
    assert.deepEqual( updated.html, html );
  } )
} )