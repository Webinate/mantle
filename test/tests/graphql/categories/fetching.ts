import * as assert from 'assert';
import { ICategory, Page } from '../../../../src';
import header from '../../header';
import {
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  GET_CATEGORY,
  GET_CATEGORIES
} from '../../../../src/graphql/client/requests/category';
import { AddCategoryInput } from '../../../../src/graphql/models/category-type';

let category: ICategory<'expanded'>,
  category2: ICategory<'expanded'>,
  slug: string = '',
  numCategories = 0;

describe('[GQL] Testing fetching of categories: ', function() {
  before(async function() {
    slug = header.makeid();

    const resp1 = await header.admin.graphql<ICategory<'expanded'>>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Test', slug: slug, description: 'This is a test' })
    });
    const resp2 = await header.admin.graphql<ICategory<'expanded'>>(ADD_CATEGORY, {
      token: new AddCategoryInput({ title: 'Test 2', slug: header.makeid() })
    });

    category = resp1.data;
    category2 = resp2.data;
  });

  after(async function() {
    const resp = await header.admin.graphql<ICategory<'expanded'>>(REMOVE_CATEGORY, { id: category._id });
    assert(resp.data);

    const resp2 = await header.admin.graphql<ICategory<'expanded'>>(REMOVE_CATEGORY, { id: category2._id });
    assert(resp2.data);
  });

  it('did fetch a single category when no logged in', async function() {
    const { data } = await header.guest.graphql<ICategory<'expanded'>>(GET_CATEGORY, { id: category._id });

    assert.equal(data.slug, slug);
    assert.equal(data.title, `Test`);
    assert.equal(data.description, `This is a test`);
  });

  it('did fetch a single category when logged in', async function() {
    const { data } = await header.user1.graphql<ICategory<'expanded'>>(GET_CATEGORY, { id: category._id });
    assert.equal(data.title, `Test`);
  });

  it('did fetch a single category by slug', async function() {
    const { data } = await header.user1.graphql<ICategory<'expanded'>>(GET_CATEGORY, { slug: category.slug });
    assert.equal(data.slug, slug);
  });

  it('did fetch many categories as a guest', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<ICategory<'expanded'>>>(GET_CATEGORIES);
    assert(data.length > 0);
  });

  it('did save the second category last', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<ICategory<'expanded'>>>(GET_CATEGORIES);

    numCategories = data.length;
    assert.equal(data[data.length - 1].slug, category2.slug);
  });

  it('did get the last category using limits and indices', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<ICategory<'expanded'>>>(GET_CATEGORIES, { limit: 1, index: numCategories - 1 });
    assert.equal(data[0].slug, category2.slug);
  });
});
