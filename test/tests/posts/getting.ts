import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page, IFileEntry, IUserEntry, IDocument, ITemplate, IVolume } from '../../../src';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { generateRandString } from '../../../src/utils/utils';
import { IDraft } from '../../../src/types/models/i-draft';

const randomSlug = generateRandString( 10 );
const privateSlug = generateRandString( 10 );
const randomCategory = generateRandString( 10 );
const randomTag = generateRandString( 10 );
const randomTag2 = generateRandString( 10 );
let numPosts: number, publicPostId: string, privatePostId: string, file: IFileEntry<'expanded'>;

describe( 'Testing fetching of posts', function() {

  before( async function() {
    const users = ControllerFactory.get( 'users' );
    const user = await users.getUser( { username: header.admin.username } );

    const volumes = ControllerFactory.get( 'volumes' );
    const volume = await volumes.create( { name: 'test', user: user._id } ) as IVolume<'expanded'>;
    file = await uploadFileToVolume( 'img-a.png', volume, 'File A' ) as IFileEntry<'expanded'>;
  } )

  it( 'fetched all posts', async function() {
    const resp = await header.admin.get( `/api/posts` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    numPosts = json.count;
  } )

  it( 'did create a public post to test fetching public post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: randomSlug,
      public: true,
      featuredImage: file._id.toString(),
      categories: [ randomCategory ],
      tags: [ randomTag, randomTag2 ]
    } as IPost<'client'> );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    publicPostId = json._id;
  } )

  it( 'did create a private post to test fetching private post data', async function() {
    const resp = await header.admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: privateSlug,
      public: false
    } );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    privatePostId = json._id;
  } )

  it( 'cannot get a post that doesnt exist', async function() {
    const resp = await header.admin.get( `/api/posts/s/--simple--test--2--` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, 'Could not find post' );
  } )

  it( 'can fetch multiple posts, and those posts have correct data', async function() {
    const resp = await header.guest.get( `/api/posts?visibility=public&sortOrder=desc&sort=created` );
    assert.deepEqual( resp.status, 200 );
    const page: Page<IPost<'client'>> = await resp.json();

    const post = page.data[ 0 ];

    assert.deepEqual( ( post.author as IUserEntry<'client'> ).username, header.admin.username );
    assert.deepEqual( post.title, 'Simple Test' );
    assert.deepEqual( post.slug, randomSlug );
    assert.deepEqual( post.public, true );
    assert.deepEqual( post.categories.length, 1 );
    assert.deepEqual( post.tags.length, 2 );
    assert.deepEqual( ( post.featuredImage as IFileEntry<'client'> )._id, file._id.toString() );

    // Check that we get the doc
    const doc = post.document as IDocument<'client'>;
    assert.notDeepEqual( doc.template, null );
    assert.deepEqual( typeof doc.template, 'object' );
    assert.deepEqual( typeof doc.author, 'string' );
    assert( doc.createdOn > 0 );
    assert( doc.lastUpdated > 0 );

    // Check elements
    assert.deepEqual( doc.elements.length, 1 );
    assert.deepEqual( doc.elements[ 0 ].zone, 'main' );
    assert.deepEqual( doc.elements[ 0 ].html, '<p></p>' );
    assert.deepEqual( doc.elements[ 0 ].parent, doc._id );
    assert.deepEqual( doc.elements[ 0 ].type, 'elm-paragraph' );
    assert( Array.isArray( doc.elementsOrder ) );
    assert.deepEqual( doc.elementsOrder[ 0 ], doc.elements[ 0 ]._id );
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
    const resp = await header.admin.get( `/api/posts?categories=${randomCategory}` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with tag specified', async function() {
    const resp = await header.admin.get( `/api/posts?tags=${randomTag}` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 2 tags specified', async function() {
    const resp = await header.admin.get( `/api/posts?tags=${randomTag},${randomTag2}` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 2 known tags specified & 1 unknown', async function() {
    const resp = await header.admin.get( `/api/posts?tags=${randomTag},${randomTag2},dinos` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 1 post with 1 known tag & 1 category', async function() {
    const resp = await header.admin.get( `/api/posts?tags=${randomTag}&categories=${randomCategory}` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 1 );
  } )

  it( 'fetched 0 posts with 1 known tag & 1 unknown category', async function() {
    const resp = await header.admin.get( `/api/posts?tags=${randomTag}&categories=super-tests-wrong` );
    assert.deepEqual( resp.status, 200 );
    const json: Page<IPost<'client'>> = await resp.json();
    assert.deepEqual( json.count, 0 );
  } )

  it( 'fetched 1 posts when not logged in as admin and post is not public', async function() {
    const resp = await header.guest.get( `/api/posts?tags=${randomTag}&categories=${randomCategory}`, null );
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
    const resp = await header.admin.get( `/api/posts/s/WRONGWRONGWRONG` );
    assert.deepEqual( resp.status, 500 );
    const json = await resp.json();
    assert.deepEqual( json.message, "Could not find post" );
  } )

  it( 'can fetch single post by slug', async function() {
    const resp = await header.admin.get( `/api/posts/s/${randomSlug}` );
    const post = await resp.json<IPost<'expanded'>>();

    assert.deepEqual( post.author.username, header.admin.username );
    assert.deepEqual( post.title, 'Simple Test' );
    assert.deepEqual( post.slug, randomSlug );
    assert.deepEqual( post.public, true );
    assert.deepEqual( post.categories.length, 1 );
    assert.deepEqual( post.tags.length, 2 );
    assert.deepEqual( post.featuredImage._id, file._id.toString() );
    assert.deepEqual( post.latestDraft, null );

    // Check that we get the doc
    const doc = post.document;
    assert.notDeepEqual( doc.template, null );
    assert.deepEqual( typeof doc.template, 'object' );
    assert.deepEqual( typeof doc.author, 'string' );
    assert( doc.createdOn > 0 );
    assert( doc.lastUpdated > 0 );

    // Check the elements
    assert.deepEqual( doc.elements.length, 1 );
    assert.deepEqual( doc.elements[ 0 ].html, '<p></p>' );
    assert.deepEqual( doc.elements[ 0 ].zone, 'main' );
    assert.deepEqual( doc.elements[ 0 ].parent, doc._id );
    assert.deepEqual( doc.elements[ 0 ].type, 'elm-paragraph' );
    assert( Array.isArray( doc.elementsOrder ) );
    assert.deepEqual( doc.elementsOrder[ 0 ], doc.elements[ 0 ]._id );
  } )

  it( 'can fetch single post by slug & not include the document', async function() {
    const resp = await header.admin.get( `/api/posts/s/${randomSlug}?document=false` );
    const post = await resp.json<IPost<'client'>>();
    assert.deepEqual( post.title, 'Simple Test' );
    assert.deepEqual( post.latestDraft, null );
    assert.deepEqual( typeof post.document, 'string' );
  } )

  it( 'cannot fetch a private post by slug when not logged in', async function() {
    const resp = await header.guest.get( `/api/posts/s/${privateSlug}` );
    assert.deepEqual( resp.status, 403 );
    const json = await resp.json();
    assert.deepEqual( json.message, "That post is marked private" );
  } )

  it( 'can fetch a public post by slug when not logged in', async function() {
    const resp = await header.guest.get( `/api/posts/s/${randomSlug}` );
    assert.deepEqual( resp.status, 200 );
    const json: IPost<'client'> = await resp.json();
    assert( json.hasOwnProperty( "_id" ) );
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