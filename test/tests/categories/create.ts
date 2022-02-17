import * as assert from 'assert';
import { ADD_CATEGORY, GET_CATEGORY, REMOVE_CATEGORY } from '../../client/requests/category';
import header from '../header';
import { AddCategoryInput, Category } from '../../../src/index';

let category: Category;

describe('Testing creation of categories', function() {
  it('does require a title and slug when creating a category', async function() {
    const resp = await header.guest.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{}
    });
    assert.ok(resp.errors![0].message.includes(`Field title of required type String! was not provided.`));
    assert.ok(resp.errors![1].message.includes(`Field slug of required type String! was not provided.`));
  });

  it('did not create a category when not logged in', async function() {
    const resp = await header.guest.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test', slug: 'Test' }
    });
    assert.deepEqual(resp.errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did not create a category for a regular user', async function() {
    const resp = await header.user1.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test', slug: 'Test' }
    });
    assert.deepEqual(resp.errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did not create a category with dangerous html in description', async function() {
    const resp = await header.user1.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test', slug: 'Test' }
    });
    assert.deepEqual(resp.errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did create category with no html', async function() {
    const existing = await header.admin.graphql<Category>(GET_CATEGORY, {
      slug: '_test'
    });

    if (existing.data && existing.data._id) {
      const deletion = await header.admin.graphql<boolean>(REMOVE_CATEGORY, {
        id: existing.data._id
      });
      assert.ok(deletion.data);
    }

    const resp = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: '<b>_Test</b>', slug: '_test', description: '<b>This is a test</b>' }
    });

    category = resp.data;
    assert.deepEqual(typeof category._id, 'string');
    assert.deepEqual(category.slug, '_test');
    assert.deepEqual(category.title, `_Test`);
    assert.deepEqual(category.description, `This is a test`);
  });

  it('did not create category called _test when one already exist', async function() {
    const resp = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test', slug: '_test' }
    });

    assert.deepEqual(resp.errors![0].message, `Category with the slug '_test' already exists`);
  });

  it('did delete the category from the create test', async function() {
    const resp = await header.admin.graphql<boolean>(REMOVE_CATEGORY, { id: category._id });
    assert(resp.data);
  });
});
