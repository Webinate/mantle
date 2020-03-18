// import * as assert from 'assert';
// import { IPost, Page, IDocument } from '../../../../src';
// import header from '../../header';
// import { generateRandString } from '../../../../src/utils/utils';
// import { postFragment } from '../fragments';
// let numPosts: number, post: IPost<'expanded'>;

// describe('[GQL] Testing deletion of posts', function() {
//   it('fetched all posts', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(`{ getPosts { count } }`);

//     numPosts = count;
//   });

//   it('did create a post to test deletion', async function() {
//     const { data: newPost } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createPost(token: {
//       title: "Simple Test",
//       slug: "${generateRandString(10)}",
//       public: true
//     }) { ...PostFields, latestDraft { _id }, document { _id } } } ${postFragment}`);

//     assert(newPost);
//     post = newPost;
//   });

//   it('cannot delete a post with invalid ID format', async function() {
//     const { errors } = await header.admin.graphql<boolean>(`mutation { removePost(id: "WRONGWRONGWRONG") }`);
//     assert.strictEqual(
//       errors[0].message,
//       'Expected type ObjectId!, found "WRONGWRONGWRONG"; ObjectId must be a single String of 24 hex characters'
//     );
//   });

//   it('cannot delete a post with invalid ID', async function() {
//     const { errors } = await header.admin.graphql<boolean>(`mutation { removePost(id: "123456789012345678901234") }`);
//     assert.strictEqual(errors[0].message, 'Could not find post');
//   });

//   it('cannot delete a post without permission', async function() {
//     const { errors } = await header.guest.graphql<boolean>(`mutation { removePost(id: "${post._id}") }`);
//     assert.strictEqual(errors[0].message, 'Authentication Error');
//   });

//   it('can delete a post with valid ID & admin permissions', async function() {
//     const { data: removed } = await header.admin.graphql<boolean>(`mutation { removePost(id: "${post._id}") }`);
//     assert(removed);
//   });

//   it('has removed the document', async function() {
//     const { data, errors } = await header.admin.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${post.document._id}") { _id } }`
//     );
//     assert(!data);
//     assert(!errors);
//   });

//   it('has cleaned up the posts successfully', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(`{ getPosts { count } }`);
//     assert(count === numPosts);
//   });
// });
