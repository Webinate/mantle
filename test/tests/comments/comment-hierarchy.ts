import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IComment } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import header from '../header';
import { randomString } from '../utils';

let post: IPost<'client'>,
  parent: IComment<'client'>, child1: IComment<'client'>, child2: IComment<'client'>;

describe( 'Testing the parent child relationship of comments: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    post = await posts.create( {
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } )
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    posts.removePost( post._id );
  } )

  it( 'did create a parent comment', async function() {
    const resp = await header.user1.post( `/api/posts/${post._id}/comments`, {
      content: "Parent", public: true
    } );
    assert.deepEqual( resp.status, 200 );
    parent = await resp.json<IComment<'client'>>();
  } );

  it( 'did create 2 children comments', async function() {
    let resp = await header.user1.post( `/api/posts/${post._id}/comments/${parent._id}`, {
      content: "Child 1", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    child1 = await resp.json<IComment<'client'>>();

    resp = await header.user1.post( `/api/posts/${post._id}/comments/${parent._id}`, {
      content: "Child 2", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    child2 = await resp.json<IComment<'client'>>();
  } );

  it( 'did add 2 children to the parent', async function() {
    const resp = await header.user1.get( `/api/comments/${parent._id}` );
    assert.deepEqual( resp.status, 200 );
    const comment = await resp.json<IComment<'client'>>();
    assert.deepEqual( comment.children.length, 2 );
    assert.deepEqual( comment.children[ 0 ], child1._id );
    assert.deepEqual( comment.children[ 1 ], child2._id );
  } );

  it( 'did set the parent of the 2 children', async function() {
    let resp = await header.user1.get( `/api/comments/${child1._id}` );
    assert.deepEqual( resp.status, 200 );
    let comment = await resp.json<IComment<'client'>>();
    assert.deepEqual( comment.parent, parent._id );

    resp = await header.user1.get( `/api/comments/${child2._id}` );
    assert.deepEqual( resp.status, 200 );
    comment = await resp.json<IComment<'client'>>();
    assert.deepEqual( comment.parent, parent._id );
  } );

  it( 'did remove a child from the parent array when child is deleted', async function() {
    let resp = await header.user1.delete( `/api/comments/${child1._id}` );
    assert.deepEqual( resp.status, 204 );

    resp = await header.user1.get( `/api/comments/${parent._id}` );
    assert.deepEqual( resp.status, 200 );
    let parentComment = await resp.json<IComment<'client'>>();
    assert.deepEqual( parentComment.children.length, 1 );
    assert.deepEqual( ( parentComment.children as string[] ).includes( child1._id ), false );
  } );

  it( 'did remove child comment when parent is deleted', async function() {
    let resp = await header.user1.delete( `/api/comments/${parent._id}` );
    assert.deepEqual( resp.status, 204 );

    resp = await header.user1.get( `/api/comments/${child2._id}` );
    assert.deepEqual( decodeURIComponent( resp.statusText ), 'Could not find comment' );
    assert.deepEqual( resp.status, 500 );
  } );
} )