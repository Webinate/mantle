import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page, IComment } from '../../../src';
import header from '../header';

let numPosts, numComments,
  postId, commentId, parentCommentId;

describe( 'Testing deletion of comments', function() {

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    numPosts = json.count;
  } )

  it( 'fetched all comments', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment<'client'>> = await resp.json();
    numComments = json.count;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--comments--test--` );
    const json: IPost<'client'> = await resp.json();
    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'can create a temp post', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--comments--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world"
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    postId = json._id;
    assert( json.public === false );
  } )

  it( 'did create a test comment', async function() {
    const resp = await header.admin.post( `/api/posts/${postId}/comments`, { content: "Hello world!", public: false } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment<'client'> = await resp.json();
    commentId = json._id;
  } )

  it( 'did incremented the number of comments by 1', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment<'client'>> = await resp.json();
    assert( json.count === numComments + 1 );
  } )

  it( 'can create a another comment which will be a parent comment', async function() {
    const resp = await header.admin.post( `/api/posts/${postId}/comments`, { content: "Parent Comment", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json: IComment<'client'> = await resp.json();
    parentCommentId = json._id;
  } )

  it( 'did incremented the number of comments by 2', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IComment<'client'>> = await resp.json();
    assert( json.count === numComments + 2 );
  } )

  it( 'can create a nested comment', async function() {
    const resp = await header.admin.post( `/api/posts/${postId}/comments/${parentCommentId}`, { content: "Child Comment", public: true } );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
  } )

  it( 'did incremented the number of comments by 3', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.count === numComments + 3 );
  } )

  it( 'cannot delete a comment with a bad id', async function() {
    const resp = await header.admin.delete( `/api/comments/abc`, {} );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot delete a comment with a valid id but doesn\'t exist', async function() {
    const resp = await header.admin.delete( `/api/comments/123456789012345678901234`, {} );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Could not find comment" );
  } )

  it( 'can delete the parent comment', async function() {
    const resp = await header.admin.delete( `/api/comments/${parentCommentId}`, {} );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'should have the 2 less comments as the parent & child were removed', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.count === numComments + 1 );
  } )

  it( 'can delete a regular existing comment', async function() {
    const resp = await header.admin.delete( `/api/comments/${commentId}`, {} );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did delete the test post', async function() {
    const resp = await header.admin.delete( `/api/posts/${postId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( json.count === numPosts );
  } )

  it( 'should have the same number of comments as before the tests started', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert( numComments === json.count );
  } )
} )