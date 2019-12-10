import * as assert from 'assert';
import { ICategory } from '../../../../src';
import header from '../../header';
import { randomString } from '../../utils';

let category: ICategory<'expanded'>;

describe('[GQL] Testing creation of categories', function() {
  it('did not create a category when not logged in', async function() {
    const resp = await header.guest.graphql<{ title: string }>(
      `mutation { createCategory( title: "Test", slug: "Test" ) { title } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Authentication Error');
  });

  it('did not create a category for a regular user', async function() {
    const resp = await header.user1.graphql<{ title: string }>(
      `mutation { createCategory( title: "Test", slug: "Test" ) { title } }`
    );
    assert.deepEqual(resp.errors[0].message, 'You do not have permission');
  });

  it('did not create a category without a slug', async function() {
    const resp = await header.admin.graphql<{ title: string }>(
      `mutation { createCategory( title: "Test", slug: "" ) { title } }`
    );
    assert.deepEqual(resp.errors[0].message, 'slug cannot be empty');
  });

  it('did not create a category without a title', async function() {
    const resp = await header.admin.graphql<{ title: string }>(
      `mutation { createCategory( title: "", slug: "${randomString()}" ) { title } }`
    );
    assert.deepEqual(resp.errors[0].message, 'title cannot be empty');
  });

  it('did create category with no html', async function() {
    const existing = await header.admin.graphql<ICategory<'expanded'>>(`{ getCategory( slug: "_test" ) { _id } }`);

    if (existing.data && existing.data._id)
      await header.admin.graphql<ICategory<'expanded'>>(`mutation { removeCategory( id: "${existing.data._id}" ) }`);

    const resp = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "<b>_Test</b>", slug: "_test", description: "<b>This is a test</b>" ) { _id, slug, title, description } }`
    );
    category = resp.data;
    assert.deepEqual(typeof category._id, 'string');
    assert.deepEqual(category.slug, '_test');
    assert.deepEqual(category.title, `_Test`);
    assert.deepEqual(category.description, `This is a test`);
  });

  it('did not create category called _test when one already exist', async function() {
    const resp = await header.admin.graphql<ICategory<'expanded'>>(
      `mutation { createCategory( title: "Test", slug: "_test" ) { _id } }`
    );

    assert.deepEqual(resp.errors[0].message, `'slug' must be unique`);
  });

  it('did delete the category from the create test', async function() {
    const resp = await header.admin.graphql<boolean>(`mutation { removeCategory( id: "${category._id}" ) }`);

    assert(resp.data);
  });
});
