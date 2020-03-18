// import * as assert from 'assert';
// import { IPost, Page, IUserEntry } from '../../../../src';
// import header from '../../header';
// import { randomString } from '../../utils';
// import ControllerFactory from '../../../../src/core/controller-factory';

// let postPublic: IPost<'expanded'>, postPrivate: IPost<'expanded'>;

// describe('[GQL] Testing filtering of posts: ', function() {
//   before(async function() {
//     const posts = ControllerFactory.get('posts');
//     const users = ControllerFactory.get('users');
//     const admin = (await users.getUser({ username: header.admin.username })) as IUserEntry<'expanded'>;

//     // Create post and comments
//     postPublic = (await posts.create({
//       author: admin!._id,
//       title: randomString() + '_first',
//       slug: randomString(),
//       public: true
//     })) as IPost<'expanded'>;

//     postPrivate = (await posts.create({
//       author: admin!._id,
//       title: randomString() + '_second',
//       slug: randomString(),
//       public: false
//     })) as IPost<'expanded'>;
//   });

//   after(async function() {
//     const posts = ControllerFactory.get('posts');
//     await posts.removePost(postPublic._id);
//     await posts.removePost(postPrivate._id);
//   });

//   it('does filter by visibility status', async function() {
//     let resp = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // Checks the order
//     assert.equal(resp.data.data[0]._id, postPrivate._id);
//     assert.equal(resp.data.data[1]._id, postPublic._id);

//     resp = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: PRIVATE, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // The first post should now be post 2, which is private
//     assert.equal(resp.data.data[0]._id, postPrivate._id);

//     resp = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: PUBLIC, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // The first post should now be post 1, which is public
//     assert.equal(resp.data.data[0]._id, postPublic._id);

//     resp = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // If we specify all we get both posts
//     assert.equal(resp.data.data[0]._id, postPrivate._id);
//     assert.equal(resp.data.data[1]._id, postPublic._id);

//     resp = await header.user1.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: PRIVATE, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // Regular users cannot see private posts
//     assert.equal(resp.data.data[0]._id, postPublic._id);
//   });

//   it('does filter by descending status', async function() {
//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // If we specify all we get both posts
//     assert.equal(data[0]._id, postPrivate._id);
//     assert.equal(data[1]._id, postPublic._id);
//   });

//   it('does filter by ascending status', async function() {
//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: asc, sort: created, limit:-1 ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     let lastIndex = data.length - 1;

//     // If we specify all we get both posts
//     assert.equal(data[lastIndex]._id, postPrivate._id);
//     assert.equal(data[lastIndex - 1]._id, postPublic._id);
//   });

//   it('does filter by author', async function() {
//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( author:"${header.admin.username}", sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     assert.equal(data[0]._id, postPrivate._id);

//     const {
//       data: { data: filtered }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( author:"NO_AUTHORS_WITH_THIS_NAME", sortOrder: desc, sort: created ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     assert.deepEqual(filtered.length, 0);
//   });

//   it('can filter based on modified in ascending order', async function() {
//     const resp = await header.admin.graphql<IPost<'expanded'>>(
//       `mutation { updatePost( token: { _id: "${postPublic._id}", brief: "Updated" } ) {
//         _id
//       }}`
//     );

//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: asc, sort: modified, limit:-1 ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     let lastIndex = data.length - 1;

//     // If we specify all we get both posts
//     assert.equal(data[lastIndex]._id, postPublic._id);
//     assert.equal(data[lastIndex - 1]._id, postPrivate._id);
//   });

//   it('can filter based on modified in descending order', async function() {
//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IPost<'expanded'>>>(
//       `{ getPosts( visibility: ALL, sortOrder: desc, sort: modified, limit:-1 ) {
//         data {
//           _id
//         }
//       }}`
//     );

//     // If we specify all we get both posts
//     assert.equal(data[0]._id, postPublic._id);
//     assert.equal(data[1]._id, postPrivate._id);
//   });
// });
