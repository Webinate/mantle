import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let category: ICategory,
  child1: ICategory,
  child2: ICategory,
  numCategories = 0;

describe( '3. Testing category hierarchies: ', function() {
  before( async function() {
    category = await header.admin.postJson( `/api/categories`, {
      title: 'Test',
      slug: header.makeid(),
      description: 'This is a test'
    } as ICategory );

    child1 = await header.admin.postJson( `/api/categories`, {
      title: 'Child 1',
      slug: header.makeid(),
      parent: category._id
    } as ICategory );

    child2 = await header.admin.postJson( `/api/categories`, {
      title: 'Child 2',
      slug: header.makeid(),
      parent: category._id
    } as ICategory );
  } )

  after( async function() {
    let resp = await header.admin.delete( `/api/categories/${category._id}` );
    assert.equal( resp.status, 204 );

    resp = await header.admin.delete( `/api/categories/${child2._id}` );
    assert.equal( resp.status, 204 );
  } )

  it( 'did fetch a single category with 2 children', async function() {
    const resp = await header.guest.getJson<ICategory>( `/api/categories/${category._id}` );
    assert.equal( resp.slug, category.slug );
    assert.equal( resp.title, `Test` );
    assert.equal( resp.children.length, 2 );
  } )

  it( 'did remove a category and its parent dropped the child instance', async function() {
    const resp = await header.admin.delete( `/api/categories/${child1._id}` );
    assert.equal( resp.status, 204 );

    const parent = await header.guest.getJson<ICategory>( `/api/categories/${category._id}` );
    assert.equal( parent.children.length, 1 );
  } )
} );