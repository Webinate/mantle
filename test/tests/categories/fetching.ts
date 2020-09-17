import * as assert from 'assert';
import header from '../header';
import {
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  GET_CATEGORY,
  GET_CATEGORIES
} from '../../../src/graphql/client/requests/category';
import { AddCategoryInput, PaginatedCategoryResponse, Category } from '../../../src/index';

let category: Category,
  category2: Category,
  slug: string = '',
  numCategories = 0;

describe('Testing fetching of categories: ', function() {
  before(async function() {
    slug = header.makeid();

    const resp1 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test', slug: slug, description: 'This is a test' }
    });
    const resp2 = await header.admin.graphql<Category>(ADD_CATEGORY, {
      token: <AddCategoryInput>{ title: 'Test 2', slug: header.makeid() }
    });

    category = resp1.data;
    category2 = resp2.data;
  });

  after(async function() {
    const resp = await header.admin.graphql<Category>(REMOVE_CATEGORY, { id: category._id });
    assert(resp.data);

    const resp2 = await header.admin.graphql<Category>(REMOVE_CATEGORY, { id: category2._id });
    assert(resp2.data);
  });

  it('did fetch a single category when no logged in', async function() {
    const { data } = await header.guest.graphql<Category>(GET_CATEGORY, { id: category._id });

    assert.equal(data.slug, slug);
    assert.equal(data.title, `Test`);
    assert.equal(data.description, `This is a test`);
  });

  it('did fetch a single category when logged in', async function() {
    const { data } = await header.user1.graphql<Category>(GET_CATEGORY, { id: category._id });
    assert.equal(data.title, `Test`);
  });

  it('did fetch a single category by slug', async function() {
    const { data } = await header.user1.graphql<Category>(GET_CATEGORY, { slug: category.slug });
    assert.equal(data.slug, slug);
  });

  it('did fetch many categories as a guest', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<PaginatedCategoryResponse>(GET_CATEGORIES);
    assert(data.length > 0);
  });

  it('did save the second category last', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<PaginatedCategoryResponse>(GET_CATEGORIES);

    numCategories = data.length;
    assert.equal(data[data.length - 1].slug, category2.slug);
  });

  it('did get the last category using limits and indices', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<PaginatedCategoryResponse>(GET_CATEGORIES, { limit: 1, index: numCategories - 1 });
    assert.equal(data[0].slug, category2.slug);
  });
});
