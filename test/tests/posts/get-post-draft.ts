import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page, IFileEntry, IVolume, IDocument, IDraftElement, IImageElement, IDraft } from '../../../src';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { randomString } from '../utils';

let volume: IVolume<'expanded'>;
let post: IPost<'expanded'>;
let file: IFileEntry<'expanded'>;
let firstDraft: IDraft<'expanded'>;

let updatedHTML: string, listHTML: string, imgHTML: string, codeHtml: string,
  drafts: IDraft<'expanded'>[];

describe( 'Testing of posts and drafts', function() {

  before( async function() {
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const posts = ControllerFactory.get( 'posts' );

    const user = await users.getUser( { username: header.admin.username } );
    volume = await volumes.create( { name: 'test', user: user._id } ) as IVolume<'expanded'>;
    file = await uploadFileToVolume( 'img-a.png', volume, 'File A' ) as IFileEntry<'expanded'>;
    post = await posts.create( {
      author: user._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } ) as IPost<'expanded'>;
  } )

  after( async function() {
    const volumes = ControllerFactory.get( 'volumes' );
    const posts = ControllerFactory.get( 'posts' );
    await volumes.remove( { _id: volume._id } );
    await posts.removePost( post._id );
  } )

  it( 'can fetch a single post and there is no draft initially', async function() {
    const resp = await header.admin.get( `/api/posts/${post._id}` );
    const postJson = await resp.json<IPost<'expanded'>>();
    assert.deepEqual( postJson.latestDraft, null );
    assert.deepEqual( typeof postJson.document._id, 'string' );
  } )

  it( 'can publish the post document with elements and latest draft is updated', async function() {
    updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
    listHTML = '<ul><li>Test 1</li><li>Test 2</li></ul>';
    imgHTML = `<figure><img src="${file.publicURL!}" /></figure>`;

    const resp1 = await header.admin.put( `/api/documents/${post.document._id}/elements/${post.document.elements[ 0 ]._id}`, { html: updatedHTML } as IDraftElement<'client'> );
    const resp2 = await header.admin.post( `/api/documents/${post.document._id}/elements`, { html: listHTML, type: 'elm-list' } as IDraftElement<'client'> );
    const resp3 = await header.admin.post( `/api/documents/${post.document._id}/elements`, { html: imgHTML, type: 'elm-image', image: file._id } as IImageElement<'client'> );
    assert.deepEqual( resp1.status, 200 );
    assert.deepEqual( resp2.status, 200 );
    assert.deepEqual( resp3.status, 200 );

    const postResponse = await header.admin.put( `/api/posts/${post._id}`, { public: true } as IPost<'client'> );
    assert.deepEqual( postResponse.status, 200 );

    const postJson = await postResponse.json<IPost<'expanded'>>();
    assert.deepEqual( typeof postJson.latestDraft._id, 'string' );
    assert.deepEqual( typeof postJson.document._id, 'string' );
    assert.deepEqual( postJson.latestDraft.html.main, updatedHTML + listHTML + imgHTML );

    firstDraft = postJson.latestDraft;
  } )

  it( 'can get the draft and not the document when asked', async function() {
    const postResponse = await header.admin.get( `/api/posts/${post._id}?document=false` );
    assert.deepEqual( postResponse.status, 200 );
    const postJson = await postResponse.json<IPost<'expanded'>>();

    assert.deepEqual( typeof postJson.latestDraft._id, 'string' );
    assert.deepEqual( typeof postJson.document, 'string' );
    assert.deepEqual( postJson.latestDraft.html.main, updatedHTML + listHTML + imgHTML );
  } )

  it( 'does not send the document model when getting posts in a page', async function() {
    const postResponse = await header.admin.get( `/api/posts?sortOrder=desc&sort=created` );
    assert.deepEqual( postResponse.status, 200 );
    const postJson = await postResponse.json<Page<IPost<'expanded'>>>();
    assert.deepEqual( postJson.data[ 0 ]._id, post._id );
    assert.deepEqual( typeof postJson.data[ 0 ].latestDraft._id, 'string' );
    assert.deepEqual( typeof postJson.data[ 0 ].document, 'string' );
    assert.deepEqual( postJson.data[ 0 ].latestDraft.html.main, updatedHTML + listHTML + imgHTML );
  } )

  it( 'does create a new draft with more changes', async function() {
    codeHtml = `<pre>Hello world</pre>`;
    let resp = await header.admin.post( `/api/documents/${post.document._id}/elements`, { html: codeHtml, type: 'elm-code' } as IDraftElement<'client'> );
    assert.deepEqual( resp.status, 200 );

    const postResponse = await header.admin.put( `/api/posts/${post._id}`, { public: true } as IPost<'client'> );
    assert.deepEqual( postResponse.status, 200 );

    const postJson = await postResponse.json<IPost<'expanded'>>();
    assert.deepEqual( typeof postJson.latestDraft._id, 'string' );
    assert.notDeepEqual( typeof postJson.latestDraft._id, firstDraft._id );
    assert.deepEqual( postJson.latestDraft.html.main, updatedHTML + listHTML + imgHTML + codeHtml );
  } )

  it( 'prevents guests from getting post draft lists', async function() {
    const resp = await header.guest.get( `/api/posts/${post._id}/drafts` );
    assert.deepEqual( resp.status, 401 );
  } )

  it( 'prevents getting post draft lists with a bad id', async function() {
    const resp = await header.guest.get( `/api/posts/BAD/drafts` );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'prevents other users from getting post draft lists', async function() {
    const resp = await header.user1.get( `/api/posts/${post._id}/drafts` );
    assert.deepEqual( resp.status, 403 );
  } )

  it( 'allows an admin to get post draft lists', async function() {
    const resp = await header.admin.get( `/api/posts/${post._id}/drafts` );
    assert.deepEqual( resp.status, 200 );
    drafts = await resp.json<IDraft<'expanded'>[]>();
    assert.deepEqual( drafts.length, 3 );
    assert.deepEqual( drafts[ 1 ].html.main, updatedHTML + listHTML + imgHTML );
    assert.deepEqual( drafts[ 2 ].html.main, updatedHTML + listHTML + imgHTML + codeHtml );
  } )

  it( 'prevents removing a post draft with a bad id', async function() {
    const resp = await header.admin.delete( `/api/posts/BAD/drafts/BAD` );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'prevents removing a post draft with a bad draft id', async function() {
    const resp = await header.admin.delete( `/api/posts/${post._id}/drafts/BAD` );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'prevents removing a post draft with a post that doesnt exist', async function() {
    const resp = await header.admin.delete( `/api/posts/123456789012345678901234/drafts/123456789012345678901234` );
    assert.deepEqual( resp.status, 404 );
  } )

  it( 'prevents removing a post draft with a draft that does not exist', async function() {
    const resp = await header.admin.delete( `/api/posts/${post._id}/drafts/123456789012345678901234` );
    assert.deepEqual( resp.status, 404 );
  } )

  it( 'prevents removing a post draft with no authentication', async function() {
    const resp = await header.guest.delete( `/api/posts/${post._id}/drafts/${drafts[ 0 ]._id}` );
    assert.deepEqual( resp.status, 401 );
  } )

  it( 'prevents removing a post draft without admin rights', async function() {
    const resp = await header.user1.delete( `/api/posts/${post._id}/drafts/${drafts[ 0 ]._id}` );
    assert.deepEqual( resp.status, 403 );
  } )

  it( 'does allow an admin to remove the first draft', async function() {
    let resp = await header.admin.delete( `/api/posts/${post._id}/drafts/${drafts[ 0 ]._id}` );
    assert.deepEqual( resp.status, 204 );

    resp = await header.admin.get( `/api/posts/${post._id}/drafts` );
    assert.deepEqual( resp.status, 200 );
    const newDrafts = await resp.json<IDraft<'expanded'>[]>();
    assert.deepEqual( newDrafts.length, 2 );
    assert.deepEqual( newDrafts[ 0 ].html.main, updatedHTML + listHTML + imgHTML );
    assert.deepEqual( newDrafts[ 1 ].html.main, updatedHTML + listHTML + imgHTML + codeHtml );
  } )

  it( 'does allow an admin to the current draft and the post draft is nullified', async function() {
    let resp = await header.admin.delete( `/api/posts/${post._id}/drafts/${drafts[ 2 ]._id}` );
    assert.deepEqual( resp.status, 204 );

    // Check there's only draft 1 left
    resp = await header.admin.get( `/api/posts/${post._id}/drafts` );
    assert.deepEqual( resp.status, 200 );
    const newDrafts = await resp.json<IDraft<'expanded'>[]>();
    assert.deepEqual( newDrafts.length, 1 );
    assert.deepEqual( newDrafts[ 0 ].html.main, updatedHTML + listHTML + imgHTML );

    // Now check that the post's draft is nullified
    resp = await header.admin.get( `/api/posts/${post._id}` );
    assert.deepEqual( resp.status, 200 );
    const postJson = await resp.json<IPost<'expanded'>>();
    assert.deepEqual( postJson.latestDraft, null );
  } )
} )