import * as assert from 'assert';
import { Page } from '../../../src';
import header from '../header';
import {
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  GET_CATEGORY,
  GET_CATEGORIES,
  GET_CATEGORY_WITH_PARENT,
  getCategoryWithChildren
} from '../../../src/graphql/client/requests/category';
import { AddCategoryInput, Category } from '../../../src/graphql/models/category-type';

let category: Category,
  child1: Category,
  sibling: Category,
  child2: Category,
  childDeep1: Category,
  numCategoriesBeforeTests = 0;

describe('[GQL] Testing category hierarchies: ', function() {
  before(async function() {
    const page = await header.admin.graphql<Page<Category>>(GET_CATEGORIES);
    numCategoriesBeforeTests = page.data.count;

    const resp = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Test', slug: header.makeid(), description: 'This is a test' })
    });
    category = resp.data;

    const resp2 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Test Sibling', slug: header.makeid(), description: 'This is test sibling' })
    });
    sibling = resp2.data;

    const resp3 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Child 1', slug: header.makeid(), parent: category._id })
    });
    child1 = resp3.data;

    const resp4 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Child 2', slug: header.makeid(), parent: category._id })
    });
    child2 = resp4.data;

    const resp5 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Child Deep 1', slug: header.makeid(), parent: child2._id })
    });

    childDeep1 = resp5.data;
  });

  after(async function() {
    let resp = await header.admin.graphql<boolean>(REMOVE_CATEGORY, { id: category._id });
    assert(resp.data);

    resp = await header.admin.graphql<boolean>(REMOVE_CATEGORY, { id: sibling._id });
    assert(resp.data);

    let existing = await header.admin.graphql<Category>(GET_CATEGORY, { id: child2._id });
    assert.deepEqual(existing.data, null);

    existing = await header.admin.graphql<Category>(GET_CATEGORY, { id: childDeep1._id });
    assert.deepEqual(existing.data, null);

    let allCats = await header.admin.graphql<Page<Partial<Category>>>(GET_CATEGORIES);
    assert.equal(numCategoriesBeforeTests, allCats.data.count, 'Number of categories not the same after test complete');
  });

  it('did fetch a single category with 2 children', async function() {
    const { data: resp } = await header.admin.graphql<Category>(getCategoryWithChildren(1), {
      id: category._id
    });

    assert.equal(resp.slug, category.slug);
    assert.equal(resp.title, `Test`);
    assert.equal(resp.children.length, 2);
  });

  it('did get a category with 1st level children objects', async function() {
    const { data: resp } = await header.admin.graphql<Category>(getCategoryWithChildren(1), {
      id: category._id
    });

    assert.equal(resp.children[0]._id, child1._id);
    assert.equal(resp.children[1]._id, child2._id);
  });

  it('did get a category parent', async function() {
    const { data: resp } = await header.admin.graphql<Category>(GET_CATEGORY_WITH_PARENT, {
      id: child1._id
    });

    assert.equal(resp.parent!._id, category._id);
  });

  it('did get a category with 2nd level children expanded', async function() {
    const { data: resp } = await header.admin.graphql<Category>(getCategoryWithChildren(2), {
      id: category._id
    });

    assert.equal(resp.children[1].children[0]._id, childDeep1._id);
  });

  it('did the last 2 root categorys', async function() {
    const { data: resp } = await header.admin.graphql<Page<Category>>(GET_CATEGORIES, { root: true });
    assert.equal(resp.data[resp.data.length - 1].slug, sibling.slug);
  });

  it('did remove a category and its parent dropped the child instances', async function() {
    const removeResp = await header.admin.graphql<boolean>(REMOVE_CATEGORY, { id: child1._id });
    assert(removeResp.data);

    const resp = await header.admin.graphql<Category>(getCategoryWithChildren(1), { id: category._id });
    assert.equal(resp.data.children.length, 1);
  });
});
