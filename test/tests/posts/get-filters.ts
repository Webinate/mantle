import * as assert from 'assert';
import { } from 'mocha';
import { IPost, Page } from '../../../src';
import header from '../header';
import { randomString } from '../utils';

let postPublic: IPost<'client'>, postPrivate: IPost<'client'>;

describe( 'Testing filtering of posts: ', function() {

  before( async function() {
    const resp1 = await header.admin.post( `/api/posts`, {
      title: randomString() + '_first',
      slug: randomString(),
      public: true
    } as IPost<'client'> );

    const resp2 = await header.admin.post( `/api/posts`, {
      title: randomString() + '_second',
      slug: randomString(),
      public: false
    } as IPost<'client'> );

    assert.equal( resp1.status, 200 );
    assert.equal( resp2.status, 200 );

    postPublic = await resp1.json() as IPost<'client'>;
    postPrivate = await resp2.json() as IPost<'client'>;
  } )

  it( 'does filter by visibility status', async function() {
    let resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=desc&sort=created` );
    let page: Page<IPost<'client'>> = await resp.json();

    // Checks the order
    assert.equal( page.data[ 0 ]._id, postPrivate._id );
    assert.equal( page.data[ 1 ]._id, postPublic._id );

    resp = await header.admin.get( `/api/posts?visibility=private&sortOrder=desc&sort=created` );
    page = await resp.json();

    // The first post should now be post 2, which is private
    assert.equal( page.data[ 0 ]._id, postPrivate._id );

    resp = await header.admin.get( `/api/posts?visibility=public&sortOrder=desc&sort=created` );
    page = await resp.json();

    // The first post should now be post 1, which is public
    assert.equal( page.data[ 0 ]._id, postPublic._id );

    resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=desc&sort=created` );
    page = await resp.json();

    // If we specify all we get both posts
    assert.equal( page.data[ 0 ]._id, postPrivate._id );
    assert.equal( page.data[ 1 ]._id, postPublic._id );

    resp = await header.user1.get( `/api/posts?visibility=private&sortOrder=desc&sort=created` );
    page = await resp.json();

    // Regular users cannot see private posts
    assert.equal( page.data[ 0 ]._id, postPublic._id );
  } )

  it( 'does filter by descending status', async function() {
    let resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=desc&sort=created` );
    let page: Page<IPost<'client'>> = await resp.json();

    // If we specify all we get both posts
    assert.equal( page.data[ 0 ]._id, postPrivate._id );
    assert.equal( page.data[ 1 ]._id, postPublic._id );
  } )

  it( 'does filter by ascending status', async function() {
    let resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=asc&sort=created&limit=-1` );
    let page: Page<IPost<'client'>> = await resp.json();
    let lastIndex = page.data.length - 1;

    // If we specify all we get both posts
    assert.equal( page.data[ lastIndex ]._id, postPrivate._id );
    assert.equal( page.data[ lastIndex - 1 ]._id, postPublic._id );
  } )

  it( 'does filter by author', async function() {
    let resp = await header.admin.get( `/api/posts?author=${header.admin.username}&sortOrder=desc&sort=created` );
    let page: Page<IPost<'client'>> = await resp.json();

    assert.equal( page.data[ 0 ]._id, postPrivate._id );

    resp = await header.admin.get( `/api/posts?author=NO_AUTHORS_WITH_THIS_NAME&sortOrder=desc&sort=created` );
    page = await resp.json();
    assert.deepEqual( page.data.length, 0 );
  } )

  it( 'can filter based on modified in ascending order', async function() {
    let resp = await header.admin.put( `/api/posts/${postPublic._id}`, { brief: "Updated" } as Partial<IPost<'client'>> );
    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=asc&sort=modified&limit=-1` );
    let page: Page<IPost<'client'>> = await resp.json();
    let lastIndex = page.data.length - 1;

    // If we specify all we get both posts
    assert.equal( page.data[ lastIndex ]._id, postPublic._id );
    assert.equal( page.data[ lastIndex - 1 ]._id, postPrivate._id );
  } )

  it( 'can filter based on modified in descending order', async function() {
    const resp = await header.admin.get( `/api/posts?visibility=all&sortOrder=desc&sort=modified&limit=-1` );
    let page: Page<IPost<'client'>> = await resp.json();
    let lastIndex = page.data.length - 1;

    // If we specify all we get both posts
    assert.equal( page.data[ 0 ]._id, postPublic._id );
    assert.equal( page.data[ 1 ]._id, postPrivate._id );
  } )

  after( async function() {
    const resp1 = await header.admin.delete( `/api/posts/${postPublic._id}` );
    const resp2 = await header.admin.delete( `/api/posts/${postPrivate._id}` );
    assert.equal( resp1.status, 204 );
    assert.equal( resp2.status, 204 );
  } )
} )