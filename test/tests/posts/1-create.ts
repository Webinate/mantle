import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IConfig, IAdminUser } from '../../../src';
import header from '../header';
import Agent from '../agent';
let numPosts: number, lastPost: IPost, lastPost2: IPost;

describe( '1. Testing creation of posts', function() {

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.strictEqual( resp.status, 200 );
    const json = await resp.json();
    numPosts = json.count;
  } )

  it( 'cannot create post when not logged in', async function() {
    const resp = await header.guest.post( `/api/posts`, { name: "" } );
    assert.strictEqual( resp.status, 401 );
    const json = await resp.json();
    assert.strictEqual( json.message, "You must be logged in to make this request" );
  } )

  it( 'cannot create a post as a regular user', async function() {
    const resp = await header.user1.post( `/api/posts`, { title: "test", slug: "" } );
    assert.strictEqual( resp.status, 403 );
  } )

  it( 'cannot create a post without title', async function() {
    const resp = await header.admin.post( `/api/posts`, { title: "", slug: "" } );
    assert.strictEqual( resp.status, 500 );
    const json = await resp.json();
    assert.strictEqual( json.message, "title cannot be empty" );
  } )

  it( 'cannot create a post without a slug field', async function() {
    const resp = await header.admin.post( `/api/posts`, { title: "test" } );
    assert.strictEqual( resp.status, 500 );
    const json = await resp.json();
    assert.strictEqual( json.message, "slug is required" );
  } )

  it( 'cannot create a post without slug', async function() {
    const resp = await header.admin.post( `/api/posts`, { title: "test", slug: "" } );
    assert.strictEqual( resp.status, 500 );
    const json = await resp.json();
    assert.strictEqual( json.message, "slug cannot be empty" );
  } )

  it( 'did delete any existing posts with the slug --simple--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--simple--test--` );
    const json = await resp.json();

    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'can create a post with valid data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--simple--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world",
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } );
    assert.strictEqual( resp.status, 200 );
    const json: IPost = await resp.json();

    lastPost = json._id;
    assert.strictEqual( json.public, false );
    assert.strictEqual( json.author.username, ( header.config.adminUser as IAdminUser ).username );
    assert.strictEqual( json.content, "Hello world" );
    assert.strictEqual( json.brief, "This is brief" );
    assert.strictEqual( json.slug, "--simple--test--" );
    assert.strictEqual( json.title, "Simple Test" );
    assert( json.categories.length === 1 );
    assert.strictEqual( json.categories[ 0 ], "super-tests" );
    assert( json.tags.length === 2 );
    assert.strictEqual( json.tags[ 0 ], "super-tags-1234" );
    assert.strictEqual( json.tags[ 1 ], "supert-tags-4321" );
    assert( json._id );
    assert( json.createdOn > 0 );
    assert( json.lastUpdated > 0 );
  } )

  it( 'did delete any existing posts with this slug --strip--test--', async function() {
    const resp = await header.admin.get( `/api/posts/slug/--strip--test--` );
    const json = await resp.json();
    if ( json )
      await header.admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'should create a post & strip HTML from title', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test <h2>NO</h2>",
      slug: "--strip--test--",
      brief: "This is brief"
    } );

    assert.strictEqual( resp.status, 200 );
    const json = await resp.json();
    assert.strictEqual( json.title, "Simple Test NO" );
    lastPost2 = json._id;
  } )

  it( 'did delete the first post', async function() {
    const resp = await header.admin.delete( `/api/posts/${lastPost}` );
    assert.strictEqual( resp.status, 204 );
  } )

  it( 'did delete the second post', async function() {
    const resp = await header.admin.delete( `/api/posts/${lastPost2}` );
    assert.strictEqual( resp.status, 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.strictEqual( resp.status, 200 );
    const json = await resp.json();
  } )
} )