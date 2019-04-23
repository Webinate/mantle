import * as assert from 'assert';
import { ICategory, Page } from '../../../../src';
import header from '../../header';
import { categoryFragment } from '../fragments';

let category: Partial<ICategory<'client'>>,
  category2: Partial<ICategory<'client'>>,
  slug: string = '',
  numCategories = 0;

describe('Testing fetching of categories: ', function() {
  before(async function() {
    slug = header.makeid();

    const resp1 = await header.admin.graphql<Partial<ICategory<'client'>>>(
      `mutation { createCategory( title: "Test", slug: "${slug}", description: "This is a test" ) { ...CategoryFields } } ${categoryFragment}`
    );
    const resp2 = await header.admin.graphql<Partial<ICategory<'client'>>>(
      `mutation { createCategory( title: "Test 2", slug: "${header.makeid()}" ) { ...CategoryFields } } ${categoryFragment}`
    );

    category = resp1.data;
    category2 = resp2.data;
  });

  after(async function() {
    const resp = await header.admin.graphql<Partial<ICategory<'client'>>>(
      `mutation { removeCategory( id: "${category._id}" ) }`
    );
    assert(resp.data);

    const resp2 = await header.admin.graphql<Partial<ICategory<'client'>>>(
      `mutation { removeCategory( id: "${category2._id}" ) }`
    );
    assert(resp2.data);
  });

  it('did fetch a single category when no logged in', async function() {
    const { data } = await header.guest.graphql<Partial<ICategory<'client'>>>(
      `{ getCategory( id: "${category._id}" ) { ...CategoryFields } } ${categoryFragment}`
    );

    assert.equal(data.slug, slug);
    assert.equal(data.title, `Test`);
    assert.equal(data.description, `This is a test`);
  });

  it('did fetch a single category when logged in', async function() {
    const { data } = await header.user1.graphql<Partial<ICategory<'client'>>>(
      `{ getCategory( id: "${category._id}" ) { ...CategoryFields } } ${categoryFragment}`
    );

    assert.equal(data.title, `Test`);
  });

  it('did fetch a single category by slug', async function() {
    const { data } = await header.user1.graphql<Partial<ICategory<'client'>>>(
      `{ getCategory( slug: "${category.slug}" ) { ...CategoryFields } } ${categoryFragment}`
    );

    assert.equal(data.slug, slug);
  });

  it('did fetch many categories as a guest', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<Partial<ICategory<'client'>>>>(
      `{ getCategories { data { ...CategoryFields } } } ${categoryFragment}`
    );

    assert(data.length > 0);
  });

  it('did save the second category last', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<Partial<ICategory<'client'>>>>(
      `{ getCategories { data { ...CategoryFields } } } ${categoryFragment}`
    );

    numCategories = data.length;
    assert.equal(data[data.length - 1].slug, category2.slug);
  });

  it('did get the last category using limits and indices', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<Partial<ICategory<'client'>>>>(
      `{ getCategories(limit:1, index:${numCategories - 1}) { data { ...CategoryFields } } } ${categoryFragment}`
    );

    assert.equal(data[0].slug, category2.slug);
  });
});
