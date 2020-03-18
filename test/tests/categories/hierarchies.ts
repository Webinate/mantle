// import * as assert from 'assert';
// import { ICategory, Page } from '../../../src';
// import header from '../header';

// let category: ICategory<'client'>,
//   child1: ICategory<'client'>,
//   sibling: ICategory<'client'>,
//   child2: ICategory<'client'>,
//   childDeep1: ICategory<'client'>,
//   numCategoriesBeforeTests = 0,
//   numCategories = 0;

// describe('Testing category hierarchies: ', function() {
//   before(async function() {
//     const page = await header.admin.getJson<Page<ICategory<'client'>>>(`/api/categories`);
//     numCategoriesBeforeTests = page.count;

//     category = await header.admin.postJson<ICategory<'client'>>(`/api/categories`, {
//       title: 'Test',
//       slug: header.makeid(),
//       description: 'This is a test'
//     } as ICategory<'client'>);

//     sibling = await header.admin.postJson<ICategory<'client'>>(`/api/categories`, {
//       title: 'Test Sibling',
//       slug: header.makeid(),
//       description: 'This is test sibling'
//     } as ICategory<'client'>);

//     child1 = await header.admin.postJson<ICategory<'client'>>(`/api/categories`, {
//       title: 'Child 1',
//       slug: header.makeid(),
//       parent: category._id
//     } as ICategory<'client'>);

//     child2 = await header.admin.postJson<ICategory<'client'>>(`/api/categories`, {
//       title: 'Child 2',
//       slug: header.makeid(),
//       parent: category._id
//     } as ICategory<'client'>);

//     childDeep1 = await header.admin.postJson<ICategory<'client'>>(`/api/categories`, {
//       title: 'Child Deep 1',
//       slug: header.makeid(),
//       parent: child2._id
//     } as ICategory<'client'>);
//   });

//   after(async function() {
//     let resp = await header.admin.delete(`/api/categories/${category._id}`);
//     assert.equal(resp.status, 204);

//     resp = await header.admin.delete(`/api/categories/${sibling._id}`);
//     assert.equal(resp.status, 204);

//     // Children removed from parents
//     resp = await header.admin.get(`/api/categories/${child2._id}`);
//     assert.equal(resp.status, 500);

//     resp = await header.admin.get(`/api/categories/${childDeep1._id}`);
//     assert.equal(resp.status, 500);

//     const page = await header.admin.getJson<Page<ICategory<'client'>>>(`/api/categories`);
//     assert.equal(numCategoriesBeforeTests, page.count, 'Number of categories not the same after test complete');
//   });

//   it('did fetch a single category with 2 children', async function() {
//     const resp = await header.admin.getJson<ICategory<'client'>>(`/api/categories/${category._id}`);
//     assert.equal(resp.slug, category.slug);
//     assert.equal(resp.title, `Test`);
//     assert.equal(resp.children.length, 2);
//   });

//   it('did get a category with 1st level children returned as ids', async function() {
//     const parent = await header.admin.getJson<ICategory<'client'>>(
//       `/api/categories/${category._id}?expanded=false&depth=1`
//     );
//     assert.equal(parent.children[0] as string, child1._id);
//     assert.equal(parent.children[1] as string, child2._id);
//   });

//   it('did get a category with 1st level children expanded', async function() {
//     const parent = await header.admin.getJson<ICategory<'client'>>(
//       `/api/categories/${category._id}?expanded=true&depth=1`
//     );
//     assert.equal((parent.children[0] as ICategory<'client'>)._id, child1._id);
//     assert.equal((parent.children[1] as ICategory<'client'>)._id, child2._id);
//     assert.equal((parent.children[1] as ICategory<'client'>).children[0], childDeep1._id);
//   });

//   it('did get a category with 2nd level children expanded', async function() {
//     const parent = await header.admin.getJson<ICategory<'client'>>(
//       `/api/categories/${category._id}?expanded=true&depth=2`
//     );
//     assert.equal(((parent.children[1] as ICategory<'client'>).children[0] as ICategory<'client'>)._id, childDeep1._id);
//   });

//   it('did get deep categories when depth query is -1', async function() {
//     const parent = await header.admin.getJson<ICategory<'client'>>(
//       `/api/categories/${category._id}?expanded=true&depth=-1`
//     );
//     assert.equal(((parent.children[1] as ICategory<'client'>).children[0] as ICategory<'client'>)._id, childDeep1._id);
//   });

//   it('did the last 2 root categorys', async function() {
//     const parent = await header.admin.getJson<Page<ICategory<'client'>>>(
//       `/api/categories?expanded=true&depth=-1&root=true`
//     );
//     assert.equal(parent.data[parent.data.length - 1].slug, sibling.slug);
//   });

//   it('did remove a category and its parent dropped the child instances', async function() {
//     const resp = await header.admin.delete(`/api/categories/${child1._id}`);
//     assert.equal(resp.status, 204);

//     const parent = await header.admin.getJson<ICategory<'client'>>(`/api/categories/${category._id}`);
//     assert.equal(parent.children.length, 1);
//   });
// });
