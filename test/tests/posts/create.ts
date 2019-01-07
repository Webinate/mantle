import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IAdminUser, IUserEntry, IDocument, ITemplate } from '../../../src';
import header from '../header';
import { generateRandString } from '../../../src/utils/utils';
import { IDraft } from '../../../src/types/models/i-draft';
let lastPost: IPost<'expanded'>, lastPost2: IPost<'expanded'>;
let numPosts = 0;

describe( 'Testing creation of posts', function() {

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

  it( 'can create a post with valid data', async function() {
    const slug = generateRandString( 10 );

    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: slug,
      brief: "This is brief",
      public: false,
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } as IPost<'client'> );
    assert.strictEqual( resp.status, 200 );
    const json: IPost<'expanded'> = await resp.json();

    lastPost = json;
    assert.strictEqual( json.public, false );
    assert.strictEqual( json.author.username, ( header.config.adminUser as IAdminUser ).username );
    assert.strictEqual( json.brief, "This is brief" );
    assert.strictEqual( json.slug, slug );
    assert.strictEqual( json.title, "Simple Test" );
    assert.strictEqual( json.featuredImage, null );
    assert( json.categories.length === 1 );
    assert.strictEqual( json.categories[ 0 ], "super-tests" );
    assert( json.tags.length === 2 );
    assert.strictEqual( json.tags[ 0 ], "super-tags-1234" );
    assert.strictEqual( json.tags[ 1 ], "supert-tags-4321" );
    assert( json._id );
    assert( json.createdOn > 0 );
    assert( json.lastUpdated > 0 );

    // Check the default doc is created
    const doc = json.document;
    assert.notDeepEqual( doc.template, null );
    assert.notDeepEqual( doc.currentDraft, null );
    assert.deepEqual( typeof doc.template, 'object' );
    assert.deepEqual( typeof doc.currentDraft, 'object' );
    assert.deepEqual( typeof doc.author, 'string' );
    assert( doc.createdOn > 0 );
    assert( doc.currentDraft.createdOn > 0 );
    assert.deepEqual( doc.currentDraft.published, false );

    // Check the elements & draft
    assert.deepEqual( doc.elements.length, 1 );
    assert.deepEqual( doc.elements[ 0 ].html, '<p></p>' );
    assert.deepEqual( doc.elements[ 0 ].parent, doc._id );
    assert.deepEqual( doc.elements[ 0 ].type, 'elm-paragraph' );
    assert( Array.isArray( doc.elementsOrder ) );
    assert.deepEqual( doc.elementsOrder[ 0 ], doc.elements[ 0 ]._id );
  } )

  it( 'can get the document associated with the post', async function() {
    const resp = await header.admin.get( `/api/documents/${lastPost.document._id}` );
    assert.strictEqual( resp.status, 200 );
  } )

  it( 'should create a post & strip HTML from title', async function() {
    const slug = generateRandString( 10 );
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test <h2>NO</h2>",
      slug: slug,
      brief: "This is brief"
    } );

    assert.strictEqual( resp.status, 200 );
    const json = await resp.json();
    assert.strictEqual( json.title, "Simple Test NO" );
    lastPost2 = json._id;
  } )

  it( 'did delete the first post', async function() {
    const resp = await header.admin.delete( `/api/posts/${lastPost._id}` );
    assert.strictEqual( resp.status, 204 );
  } )

  it( 'did delete the second post', async function() {
    const resp = await header.admin.delete( `/api/posts/${lastPost2}` );
    assert.strictEqual( resp.status, 204 );
  } )
} )