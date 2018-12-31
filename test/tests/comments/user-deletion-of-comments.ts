import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IComment, IUserEntry } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import header from '../header';
import { randomString } from '../utils';
import Agent from '../agent';

let post: IPost<'expanded'>,
  newUserAgent: Agent,
  newUser: IUserEntry<'expanded'>,
  root: IComment<'expanded'>,
  rootChild: IComment<'expanded'>,
  otherUserComment: IComment<'expanded'>,
  replyComment: IComment<'expanded'>;

describe( 'When user deleted, comments must be nullified or removed: ', function() {

  before( async function() {
    const users = ControllerFactory.get( 'users' );
    const posts = ControllerFactory.get( 'posts' );

    // Create new user
    newUserAgent = await header.createUser( 'user3', 'password', 'user3@test.com', 3 );
    newUser = await users.getUser( { username: 'user3' } ) as IUserEntry<'expanded'>;

    post = await posts.create( {
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } ) as IPost<'expanded'>
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    posts.removePost( post._id );
  } )

  it( 'did create a root comment with a child', async function() {
    let resp = await newUserAgent.post( `/api/posts/${post._id}/comments`, {
      content: "Root comment", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    root = await resp.json<IComment<'expanded'>>();

    resp = await newUserAgent.post( `/api/posts/${post._id}/comments/${root._id}`, {
      content: "Root comment", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    rootChild = await resp.json<IComment<'expanded'>>();
  } );

  it( 'did create a reply comment', async function() {
    let resp = await header.user1.post( `/api/posts/${post._id}/comments`, {
      content: "Other user's comment", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    otherUserComment = await resp.json<IComment<'expanded'>>();

    resp = await newUserAgent.post( `/api/posts/${post._id}/comments/${otherUserComment._id}`, {
      content: "Reply comment", public: true
    } );

    assert.deepEqual( resp.status, 200 );
    replyComment = await resp.json<IComment<'expanded'>>();
  } );

  it( 'did allow an admin to see the comments', async function() {
    let resp = await header.admin.get( `/api/comments/${root._id}` );
    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/comments/${rootChild._id}` );
    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/comments/${replyComment._id}` );
    assert.deepEqual( resp.status, 200 );
  } );

  it( 'did remove the new user', async function() {
    const resp = await newUserAgent.delete( `/api/users/${newUser.username}` );
    assert.deepEqual( resp.status, 204 );
  } );

  it( 'did remove the new users root comment & root reply', async function() {
    let resp = await header.admin.get( `/api/comments/${root._id}` );
    assert.deepEqual( resp.status, 500 );

    resp = await header.admin.get( `/api/comments/${rootChild._id}` );
    assert.deepEqual( resp.status, 500 );
  } );

  it( 'did not remove the reply comment, but did nullify the user property', async function() {
    let resp = await header.admin.get( `/api/comments/${replyComment._id}` );
    assert.deepEqual( resp.status, 200 );
    const comment = await resp.json<IComment<'client'>>();
    assert.deepEqual( comment.user, null );
    assert.deepEqual( comment.author, 'user3' );
  } );
} )