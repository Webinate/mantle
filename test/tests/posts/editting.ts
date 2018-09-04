import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page } from '../../../src';
import header from '../header';
let numPosts: number, postId: string, secondPostId: string;

describe( 'Testing editing of posts', function() {

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    numPosts = json.count;
  } )

  it( 'did delete any existing posts with the slug --edit--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--edit--test--` );
    const json: IPost<'client'> = await resp.json();

    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did delete any existing posts with the slug --second--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--second--test--` );
    const json: IPost<'client'> = await resp.json();

    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did create a post to test editting post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--edit--test--",
      public: true,
      content: "Hello world"
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    postId = json._id;
  } )

  it( 'did create a second post to test editting post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--second--test--",
      public: true,
      content: "Hello world"
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    secondPostId = json._id;
  } )

  it( 'cannot edit a post with an invalid ID', async function() {
    const resp = await header.admin.put( `/api/posts/woohoo`, { title: "Simple Test 3" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot edit a post with an valid ID but doesnt exist', async function() {
    const resp = await header.admin.put( `/api/posts/123456789012345678901234`, { title: "Simple Test 3" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Resource does not exist" );
  } )

  it( 'cannot edit a post without permission', async function() {
    const resp = await header.guest.put( `/api/posts/${postId}`, { title: "Simple Test 3" } );
    assert.deepEqual( resp.status, 401 );
    const json = await resp.json();
    assert.deepEqual( json.message, "You must be logged in to make this request" );
  } )

  it( 'cannot change an existing post with a slug already in use', async function() {
    const resp = await header.admin.put( `/api/posts/${secondPostId}`, { slug: "--edit--test--" } );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "'slug' must be unique" );
  } )

  it( 'can change a post slug with a slug already in use, if its the same post', async function() {
    const resp = await header.admin.put( `/api/posts/${postId}`, { id: postId, slug: "--edit--test--" } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    assert.deepEqual( json._id, postId );
    assert.deepEqual( json.slug, '--edit--test--' );
    assert.deepEqual( json.title, 'Simple Test' );
  } )

  it( 'can edit a post with valid details', async function() {
    const resp = await header.admin.put( `/api/posts/${postId}`, { content: "Updated" } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    assert.deepEqual( json._id, postId );
    assert.deepEqual( json.content, 'Updated' );
  } )

  it( 'did cleanup the test post', async function() {
    const resp = await header.admin.delete( `/api/posts/${postId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did cleanup the second test post', async function() {
    const resp = await header.admin.delete( `/api/posts/${secondPostId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert( json.count === numPosts );
  } )
} )