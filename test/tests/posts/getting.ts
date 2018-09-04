import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page } from '../../../src';
import header from '../header';
let numPosts: number, publicPostId: string, privatePostId: string;

describe( 'Testing fetching of posts', function() {

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    numPosts = json.count;
  } )

  it( 'did delete any existing posts with the slug --public--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--public--test--` );
    const json: IPost<'client'> = await resp.json();
    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did delete any existing posts with the slug --private--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--private--test--` );
    const json: IPost<'client'> = await resp.json();

    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did create a public post to test fetching public post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--public--test--",
      public: true,
      content: "Hello world",
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    publicPostId = json._id;
  } )

  it( 'did create a private post to test fetching private post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--private--test--",
      public: false,
      content: "Hello world"
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    privatePostId = json._id;
  } )

  it( 'cannot get a post that doesnt exist', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--simple--test--2--` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, 'Could not find post' );
  } )

  it( 'can fetch posts and impose a limit off 1 on them', async function() {
    const resp = await header.admin.get( `/api/posts?limit=1` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert( json.data.length === 1 );
  } )

  it( 'can fetch posts and impose an index and limit', async function() {
    const resp = await header.admin.get( `/api/posts?index=${numPosts ? numPosts - 1 : 0}&limit=1` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert( json.data.length === 1 );
  } )

  it( 'fetched 1 post with category specified', async function() {
    const resp = await header.admin.get( `/api/posts?categories=super-tests` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with tag specified', async function() {
    const resp = await header.admin.get( `/api/posts?tags=super-tags-1234` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 2 tags specified', async function() {
    const resp = await header.admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 2 known tags specified & 1 unknown', async function() {
    const resp = await header.admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321,dinos` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 1 known tag & 1 category', async function() {
    const resp = await header.admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 0 posts with 1 known tag & 1 unknown category', async function() {
    const resp = await header.admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests-wrong` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 0 );
  } )

  it( 'fetched 1 posts when not logged in as admin and post is not public', async function() {
    const resp = await header.guest.get( `/api/posts?tags=super-tags-1234&categories=super-tests`, null );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'Should not fetch with a tag that is not associated with any posts', async function() {
    const resp = await header.admin.get( `/api/posts?tags=nononononononoonononono` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 0 );
  } )

  it( 'cannot fetch single post by invalid slug', async function() {
    const resp = await header.admin.get( `/api/posts/slug/WRONGWRONGWRONG` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Could not find post" );
  } )

  it( 'can fetch single post by slug', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--public--test--` );
  } )

  it( 'cannot fetch a private post by slug when not logged in', async function() {
    const resp = await header.guest.get( `/api/posts/slug/--private--test--` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "That post is marked private" );

  } )

  it( 'can fetch a public post by slug when not logged in', async function() {
    const resp = await header.guest.get( `/api/posts/slug/--public--test--` );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    assert( json.hasOwnProperty( "_id" ) )
  } )

  it( 'did cleanup the test public post', async function() {
    const resp = await header.admin.delete( `/api/posts/${publicPostId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did cleanup the test private post', async function() {
    const resp = await header.admin.delete( `/api/posts/${privatePostId}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert( json.count === numPosts );
  } )
} )