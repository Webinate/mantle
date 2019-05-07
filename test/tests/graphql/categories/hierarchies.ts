import * as assert from 'assert';
import { ICategory, Page } from '../../../../src';
import header from '../../header';
import { categoryFragment } from '../fragments';

let category: ICategory<'expanded'>,
  child1: ICategory<'expanded'>,
  sibling: ICategory<'expanded'>,
  child2: ICategory<'expanded'>,
  childDeep1: ICategory<'expanded'>,
  numCategoriesBeforeTests = 0;

describe('[GQL] Testing category hierarchies: ', function() {
  before(async function() {
    const page = await header.admin.getJson<Page<ICategory<'expanded'>>>(`/api/categories`);
    numCategoriesBeforeTests = page.count;

    const resp = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Test", slug: "${header.makeid()}", description: "This is a test" ) { ...CategoryFields } } ${categoryFragment}`
    );
    category = resp.data;

    const resp2 = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Test Sibling", slug: "${header.makeid()}", description: "This is test sibling" ) { ...CategoryFields } } ${categoryFragment}`
    );
    sibling = resp2.data;

    const resp3 = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Child 1", slug: "${header.makeid()}", parent: "${
        category._id
      }" ) { ...CategoryFields, parent { _id } } } ${categoryFragment}`
    );
    child1 = resp3.data;

    const resp4 = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Child 2", slug: "${header.makeid()}", parent: "${
        category._id
      }" ) { ...CategoryFields } } ${categoryFragment}`
    );
    child2 = resp4.data;

    const resp5 = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Child Deep 1", slug: "${header.makeid()}", parent: "${
        child2._id
      }" ) { ...CategoryFields } } ${categoryFragment}`
    );

    childDeep1 = resp5.data;
  });

  after(async function() {
    let resp = await header.admin.graphql<boolean>(`mutation { removeCategory( id: "${category._id}" ) }`);
    assert(resp.data);

    resp = await header.admin.graphql<boolean>(`mutation { removeCategory( id: "${sibling._id}" ) }`);
    assert(resp.data);

    let existing = await header.admin.graphql<ICategory<'expanded'>>(`{ getCategory( id: "${child2._id}" ) { _id } }`);
    assert.deepEqual(existing.data, null);

    existing = await header.admin.graphql<ICategory<'expanded'>>(`{ getCategory( id: "${childDeep1._id}" ) { _id } }`);
    assert.deepEqual(existing.data, null);

    let allCats = await header.admin.graphql<Page<Partial<ICategory<'expanded'>>>>(`{ getCategories { count } }`);
    assert.equal(numCategoriesBeforeTests, allCats.data.count, 'Number of categories not the same after test complete');
  });

  it('did fetch a single category with 2 children', async function() {
    const { data: resp } = await header.admin.graphql<ICategory<'expanded'>>(
      `{ getCategory( id: "${category._id}" ) { ...CategoryFields, children { _id } } } ${categoryFragment}`
    );

    assert.equal(resp.slug, category.slug);
    assert.equal(resp.title, `Test`);
    assert.equal(resp.children.length, 2);
  });

  it('did get a category with 1st level children objects', async function() {
    const { data: resp } = await header.admin.graphql<ICategory<'expanded'>>(
      `{ getCategory( id: "${category._id}" ) { ...CategoryFields, children { _id } } } ${categoryFragment}`
    );

    assert.equal(resp.children[0]._id, child1._id);
    assert.equal(resp.children[1]._id, child2._id);
  });

  it('did get a category with 2nd level children expanded', async function() {
    const { data: resp } = await header.admin.graphql<ICategory<'expanded'>>(
      `{ getCategory( id: "${
        category._id
      }" ) { ...CategoryFields, children { children { _id } } } } ${categoryFragment}`
    );

    assert.equal(resp.children[1].children[0]._id, childDeep1._id);
  });

  it('did the last 2 root categorys', async function() {
    const { data: resp } = await header.admin.graphql<Page<ICategory<'expanded'>>>(
      `{ getCategories( root: true ) { data { ...CategoryFields } } } ${categoryFragment}`
    );

    assert.equal(resp.data[resp.data.length - 1].slug, sibling.slug);
  });

  it('did remove a category and its parent dropped the child instances', async function() {
    const removeResp = await header.admin.graphql<boolean>(`mutation { removeCategory( id: "${child1._id}" ) }`);
    assert(removeResp.data);

    const resp = await header.admin.graphql<ICategory<'expanded'>>(
      `{ getCategory( id: "${category._id}" ) { children { _id } } }`
    );
    assert.equal(resp.data.children.length, 1);
  });
});
