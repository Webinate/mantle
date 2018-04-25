import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IConfig, IAdminUser, IComment, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let guest: Agent, admin: Agent, config: IConfig, numPosts: number,
  numComments: number, postId: string, publicCommentId: string,
  privateCommentId: string, parentCommentId: string, childCommentId: string;

describe( '3. Testing fetching of comments', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.guest;
    admin = header.admin;
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
    const json = await resp.json();
    postId = json._id;
    assert( json.public === false );
  } )

  it( 'did create a test public comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world public! __filter__", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    publicCommentId = json._id;
  } )

  it( 'did create a test private comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world private! __filter__", public: false } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    privateCommentId = json._id;
  } )

  it( 'can create a another comment which will be a parent comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Parent Comment", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    parentCommentId = json._id;
  } )

  it( 'can create a nested comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments/${parentCommentId}`, { content: "Child Comment", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    childCommentId = json._id;
  } )

  it( 'cannot get a comment with an invalid id', async function() {
    const resp = await admin.get( `/api/comments/BADID` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot get a comment that does not exist', async function() {
    const resp = await admin.get( `/api/comments/123456789012345678901234` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Could not find comment" );
  } )

  it( 'can get a valid comment by ID', async function() {
    const resp = await admin.get( `/api/comments/${publicCommentId}` );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert.deepEqual( json._id, publicCommentId );
  } )

  it( 'cannot get a private comment without being logged in', async function() {
    const resp = await guest.get( `/api/comments/${privateCommentId}` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "That comment is marked private" );
  } )

  it( 'can get a public comment without being logged in', async function() {
    const resp = await guest.get( `/api/comments/${publicCommentId}` );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert.deepEqual( json._id, publicCommentId );
  } )

  it( 'can get comments by user & there are more than 1', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment> = await resp.json();
    assert( json.count >= 2 );
  } )

  it( 'can get comments by user & there should be 2 if we filter by keyword', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments?keyword=__filter__` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment> = await resp.json();
    assert( json.data.length === 2 );
  } )

  it( 'can get comments by user & should limit whats returned to 1', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments?keyword=__filter__&limit=1` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment> = await resp.json();
    assert( json.data.length === 1 );
  } )

  it( 'can get comments by user & should limit whats returned to 1 if not admin', async function() {
    const resp = await guest.get( `/api/users/${admin.username}/comments?keyword=__filter__` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment> = await resp.json();
    assert( json.data.length === 1 );
  } )

  it( 'can get the parent comment and has previously created comment as child', async function() {
    const resp = await admin.get( `/api/comments/${parentCommentId}` );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert.deepEqual( json._id, parentCommentId );
    assert( json.children.indexOf( childCommentId ) !== -1 );
  } )

  it( 'can get a comment with parent & post, and both properties are just ids (not expanded)', async function() {
    const resp = await admin.get( `/api/comments/${childCommentId}` );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert.deepEqual( json._id, childCommentId );
    assert.deepEqual( json.parent, parentCommentId );
    assert.deepEqual( json.post, postId );
  } )

  it( 'can get a comment with parent & post, and both properties are the respective objects (expanded)', async function() {
    const resp = await admin.get( `/api/comments/${childCommentId}?expanded=true` );
    assert.deepEqual( resp.status, 200 );
    const json: IComment = await resp.json();
    assert.deepEqual( json._id, childCommentId );
    assert.deepEqual( json.parent, parentCommentId );
    assert.deepEqual( ( json.post as IPost )._id, postId );
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
    assert( numComments === json.count );
  } )
} )