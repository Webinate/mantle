import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let category: ICategory,
  category2: ICategory,
  slug: string = '',
  numCategories = 0;

describe( '2. Testing fetching of categories: ', function() {
  before( async function() {
    slug = header.makeid();

    category = await header.admin.postJson( `/api/categories`, {
      title: 'Test',
      slug: slug,
      description: 'This is a test'
    } as ICategory );

    category2 = await header.admin.postJson( `/api/categories`, {
      title: 'Test 2',
      slug: header.makeid()
    } as ICategory );
  } )

  after( async function() {
    let resp = await header.admin.delete( `/api/categories/${category._id}` );
    assert.equal( resp.status, 204 );

    resp = await header.admin.delete( `/api/categories/${category2._id}` );
    assert.equal( resp.status, 204 );
  } )

  it( 'did fetch a single category when no logged in', async function() {
    const resp = await header.guest.getJson<ICategory>( `/api/categories/${category._id}` );
    assert.equal( resp.slug, slug );
    assert.equal( resp.title, `Test` );
    assert.equal( resp.description, `This is a test` );
  } )

  it( 'did fetch a single category when logged in', async function() {
    const resp = await header.user1.getJson<ICategory>( `/api/categories/${category._id}` );
    assert.equal( resp.title, `Test` );
  } )

  it( 'did fetch a single category by slug', async function() {
    const resp = await header.user1.getJson<ICategory>( `/api/categories/slug/${slug}` );
    assert.equal( resp.slug, slug );
  } )

  it( 'did fetch many categories as a guest', async function() {
    const resp = await header.guest.getJson<Page<ICategory>>( `/api/categories` );
    assert( resp.data.length > 0 );
  } )

  it( 'did save the second category last', async function() {
    const resp = await header.guest.getJson<Page<ICategory>>( `/api/categories` );
    numCategories = resp.data.length;
    assert.equal( resp.data[ resp.data.length - 1 ].slug, category2.slug );
  } )

  it( 'did get the last category using limits and indices', async function() {
    const resp = await header.guest.getJson<Page<ICategory>>( `/api/categories?limit=1&index=${numCategories - 1}` );
    assert.equal( resp.data[ 0 ].slug, category2.slug );
  } )
} );