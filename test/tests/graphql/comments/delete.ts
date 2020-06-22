// import * as assert from 'assert';
// import { IPost, Page, IComment } from '../../../../src';
// import header from '../../header';
// import { generateRandString } from '../../../../src/utils/utils';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { ADD_POST } from '../../../../src/graphql/client/requests/posts';
// import { AddPostInput } from '../../../../src/graphql/models/post-type';

// let numPosts: number, numComments: number, postId: string, commentId: string, parentCommentId: string;

// describe('[GQL] Testing deletion of comments', function() {
//   it('fetched all posts', async function() {
//     const posts = await ControllerFactory.get('posts').getPosts({});
//     const comments = await ControllerFactory.get('comments').getAll({});

//     numPosts = posts.count;
//     numComments = comments.count;
//   });

//   it('can create a temp post', async function() {
//     const {
//       data: { _id, public: isPublic }
//     } = await header.admin.graphql<IPost<'expanded'>>(ADD_POST, {
//       token: new AddPostInput({
//         title: 'Simple Test',
//         slug: generateRandString(10),
//         brief: 'This is brief',
//         public: false
//       })
//     });

//     postId = _id;
//     assert(isPublic === false);
//   });

//   it('did create a test comment', async function() {
//     const {
//       data: { _id }
//     } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createComment( token: {
//       post: "${postId}",
//       content: "Hello world!",
//       public: false
//      } ) { _id } }`);

//     commentId = _id;
//   });

//   it('did incremented the number of comments by 1', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);
//     assert(count === numComments + 1);
//   });

//   it('can create a another comment which will be a parent comment', async function() {
//     const {
//       data: { _id }
//     } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createComment( token: {
//       post: "${postId}",
//       content: "Parent Comment",
//       public: true
//      } ) { _id } }`);

//     parentCommentId = _id;
//   });

//   it('did incremented the number of comments by 2', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);
//     assert(count === numComments + 2);
//   });

//   it('can create a nested comment', async function() {
//     const {
//       data: { _id }
//     } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createComment( token: {
//       post: "${postId}",
//       parent: "${parentCommentId}",
//       content: "Parent Comment",
//       public: true
//      } ) { _id } }`);
//     assert(_id);
//   });

//   it('did incremented the number of comments by 3', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);
//     assert(count === numComments + 3);
//   });

//   it('cannot delete a comment with a bad id', async function() {
//     const { errors } = await header.admin.graphql<boolean>(`mutation { removeComment(id: "abc") }`);
//     assert.deepEqual(
//       errors[0].message,
//       'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
//     );
//   });

//   it("cannot delete a comment with a valid id but doesn't exist", async function() {
//     const { errors } = await header.admin.graphql<boolean>(
//       `mutation { removeComment(id: "123456789012345678901234") }`
//     );
//     assert.deepEqual(errors[0].message, 'Could not find comment');
//   });

//   it('can delete the parent comment', async function() {
//     const { data } = await header.admin.graphql<boolean>(`mutation { removeComment(id: "${parentCommentId}") }`);
//     assert.deepEqual(data, true);
//   });

//   it('should have the 2 less comments as the parent & child were removed', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);
//     assert(count === numComments + 1);
//   });

//   it('can delete a regular existing comment', async function() {
//     const { data } = await header.admin.graphql<boolean>(`mutation { removeComment(id: "${commentId}") }`);
//     assert.deepEqual(data, true);
//   });

//   it('did delete the test post', async function() {
//     const { data } = await header.admin.graphql<boolean>(`mutation { removePost(id: "${postId}") }`);
//     assert.deepEqual(data, true);
//   });

//   it('has cleaned up the posts successfully', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<{ count: number }>(`{ getPosts { count } }`);
//     assert(count === numPosts);
//   });

//   it('should have the same number of comments as before the tests started', async function() {
//     const comments = await ControllerFactory.get('comments').getAll({});
//     assert(numComments === comments.count);
//   });
// });
