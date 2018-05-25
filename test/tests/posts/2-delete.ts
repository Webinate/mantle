import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IConfig, IAdminUser, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';
let numPosts: number, postId: string;

describe( '2. Testing deletion of posts', function() {

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.strictEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    numPosts = json.count;
  } )

  it( 'did create a post to test deletion', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--simple--test--",
      public: true,
      content: "Hello world"
    } );

    assert.strictEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    postId = json._id;
  } )

  it( 'cannot delete a post with invalid ID format', async function() {
    const resp = await header.admin.delete( `/api/posts/WRONGWRONGWRONG` );
    assert.strictEqual( resp.status, 500 );
    const json = await resp.json();
    assert.strictEqual( json.message, "Invalid ID format" );
  } )

  it( 'cannot delete a post with invalid ID', async function() {
    const resp = await header.admin.delete( `/api/posts/123456789012345678901234` );
    assert.strictEqual( resp.status, 500 );
    const json = await resp.json();
    assert.strictEqual( json.message, "Could not find a post with that ID" );
  } )

  it( 'cannot delete a post without permission', async function() {
    const resp = await header.guest.delete( `/api/posts/${postId}`, null );
    assert.strictEqual( resp.status, 401 );
    const json = await resp.json();
    assert.strictEqual( json.message, "You must be logged in to make this request" );
  } )

  it( 'can delete a post with valid ID & admin permissions', async function() {
    const resp = await header.admin.delete( `/api/posts/${postId}` );
    assert.strictEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.strictEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert( json.count === numPosts );
  } )
} )