import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IConfig, IAdminUser, IComment, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let guest: Agent, admin: Agent, config: IConfig, numPosts: number,
  numComments: number, postId: string, commentId: string;

describe( '1. Testing creation of comments', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--comments--test--` );
    const json = await resp.json();
    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'fetched all posts', async function() {
    const resp = await admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    numPosts = json.count;
  } )

  it( 'fetched all comments', async function() {
    const resp = await admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    numComments = json.count;
  } )

  it( 'can create a temp post', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--comments--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world"
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost = await resp.json();
    postId = json._id;
    assert( json.public === false )
  } )

  it( 'cannot create a comment when not logged in', async function() {
    const resp = await guest.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You must be logged in to make this request" );
  } )

  it( 'cannot create a comment with a badly formatted post id', async function() {
    const resp = await admin.post( `/api/posts/bad/comments/bad` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot create a comment with a badly formatted parent comment id', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments/bad` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot create a comment without a post that actually exists', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "post does not exist" );
  } )

  it( 'cannot create a comment without a post that actually exists', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "No comment exists with the id 123456789012345678901234" );
  } )

  it( 'cannot create a comment on a post that does exist with illegal html', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__ <script type='text/javascript'>alert(\"BOOO\")</script>" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "'content' has html code that is not allowed" );
  } )

  it( 'can create a comment on a valid post', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__", public: false } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    commentId = json._id;
    assert( json._id );
    assert( json.author );
    assert( !json.parent );
    assert.deepEqual( json.post, postId );
    assert.deepEqual( json.content, "Hello world! __filter__" );
    assert( json.children.length === 0 );
    assert( json.public === false );
    assert( json.createdOn );
    assert( json.lastUpdated );
  } )

  it( 'can create a another comment on the same post, with a parent comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments/${commentId}`, { content: "Hello world 2", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert( json.hasOwnProperty( '_id' ) )
  } )

  it( 'did delete the test post', async function() {
    const resp = await admin.delete( `/api/posts/${postId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost> = await resp.json();
    assert( json.count === numPosts );
  } )

  it( 'should have the same number of comments as before the tests started', async function() {
    const resp = await admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment> = await resp.json();
    assert( json.count );
    assert( numComments === json.count );
  } )
} )