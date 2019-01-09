import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page, IFileEntry, IVolume, IDocument, IDraftElement, IImageElement } from '../../../src';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { randomString } from '../utils';

let volume: IVolume<'expanded'>;
let post: IPost<'expanded'>;
let file: IFileEntry<'expanded'>;

let updatedHTML: string, listHTML: string, imgHTML: string;

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
  } )

  it( 'can get the draft and not the document when asked', async function() {
    const postResponse = await header.admin.get( `/api/posts/${post._id}?document=false` );
    assert.deepEqual( postResponse.status, 200 );
    const postJson = await postResponse.json<IPost<'expanded'>>();

    assert.deepEqual( typeof postJson.latestDraft._id, 'string' );
    assert.deepEqual( typeof postJson.document, 'string' );
    assert.deepEqual( postJson.latestDraft.html.main, updatedHTML + listHTML + imgHTML );
  } )
} )