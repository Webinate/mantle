import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';
import { randomString } from '../utils';

let category: ICategory<'client'>;

describe( 'Testing creation of categories', function() {

  it( 'did not create a category when not logged in', async function() {
    const resp = await header.guest.post( `/api/categories`, { title: 'Test' } as ICategory<'client'> );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not create a category for a regular user', async function() {
    const resp = await header.user1.post( `/api/categories`, { title: 'Test' } as ICategory<'client'> );
    assert.equal( resp.status, 403 );
  } )

  it( 'did not create a category without a slug', async function() {
    const resp = await header.admin.post( `/api/categories`, { title: 'Test' } as ICategory<'client'> );
    assert.equal( resp.status, 500 );
    assert.equal( decodeURIComponent( resp.statusText ), `slug cannot be empty` );
  } )

  it( 'did not create a category without a title', async function() {
    const resp = await header.admin.post( `/api/categories`, { slug: randomString() } as ICategory<'client'> );
    assert.equal( resp.status, 500 );
    assert.equal( decodeURIComponent( resp.statusText ), `title cannot be empty` );
  } )

  it( 'did not create a category with an empty title', async function() {
    const resp = await header.admin.post( `/api/categories`, { title: '', slug: randomString() } as ICategory<'client'> );
    assert.equal( resp.status, 500 );
    assert.equal( decodeURIComponent( resp.statusText ), `title cannot be empty` );
  } )

  it( 'did not create a category with an empty slug', async function() {
    const resp = await header.admin.post( `/api/categories`, { title: 'Test', slug: '' } as ICategory<'client'> );
    assert.equal( resp.status, 500 );
    assert.equal( decodeURIComponent( resp.statusText ), `slug cannot be empty` );
  } )

  it( 'did create category called _test with no html', async function() {

    category = await header.admin.getJson<ICategory<'client'>>( `/api/categories/slug/_test` );
    if ( category )
      await header.admin.delete( `/api/categories/${category._id}` )

    const resp = await header.admin.post( `/api/categories`, {
      title: '<b>_Test</b>',
      slug: '_test',
      description: '<b>This is a test</b>'
    } as ICategory<'client'> );
    assert.equal( resp.status, 200 );
    category = await resp.json();
    assert.equal( category.slug, `_test` );
    assert.equal( category.title, `_Test` );
    assert.equal( category.description, `This is a test` );
  } )

  it( 'did not create category called _test when one already exist', async function() {
    const resp = await header.admin.post( `/api/categories`, {
      title: 'Test',
      slug: '_test'
    } as ICategory<'client'> );
    assert.equal( resp.status, 500 );
    assert.equal( decodeURIComponent( resp.statusText ), `'slug' must be unique` );
  } )

  it( 'did delete the category from the create test', async function() {
    const resp = await header.admin.delete( `/api/categories/${category._id}` );
    assert.equal( resp.status, 204 );
  } )
} );