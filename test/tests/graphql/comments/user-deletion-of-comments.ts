// import * as assert from 'assert';
// import { IPost, IComment, IUserEntry } from '../../../../src';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import header from '../../header';
// import { randomString } from '../../utils';
// import Agent from '../../agent';

// let post: IPost<'expanded'>,
//   newUserAgent: Agent,
//   newUser: IUserEntry<'expanded'>,
//   root: IComment<'expanded'>,
//   rootChild: IComment<'expanded'>,
//   replyComment: IComment<'expanded'>;

// describe('[GQL] When user deleted, comments must be nullified or removed: ', function() {
//   before(async function() {
//     const users = ControllerFactory.get('users');
//     const posts = ControllerFactory.get('posts');

//     // Create new user
//     newUserAgent = await header.createUser('user3', 'password', 'user3@test.com', 'regular');
//     newUser = (await users.getUser({ username: 'user3' })) as IUserEntry<'expanded'>;

//     post = (await posts.create({
//       slug: randomString(),
//       title: 'Temp Post',
//       public: true
//     })) as IPost<'expanded'>;
//   });

//   after(async function() {
//     const posts = ControllerFactory.get('posts');
//     posts.removePost(post._id);
//   });

//   it('did create a root comment with a child', async function() {
//     const { data: rootComment } = await newUserAgent.graphql<IComment<'expanded'>>(
//       `mutation { createComment(token: {
//         post: "${post._id}",
//         content: "Root comment",
//         public: true
//       }) { _id } }`
//     );

//     const { data: childComment } = await newUserAgent.graphql<IComment<'expanded'>>(
//       `mutation { createComment(token: {
//         post: "${post._id}",
//         parent: "${rootComment._id}",
//         content: "Root comment",
//         public: true
//       }) { _id } }`
//     );

//     assert(rootComment);
//     assert(childComment);
//     root = rootComment;
//     rootChild = childComment;
//   });

//   it('did create a reply comment', async function() {
//     const { data: rootComment } = await header.user1.graphql<IComment<'expanded'>>(
//       `mutation { createComment(token: {
//         post: "${post._id}",
//         content: "Other user's comment",
//         public: true
//       }) { _id } }`
//     );

//     const { data: childComment } = await newUserAgent.graphql<IComment<'expanded'>>(
//       `mutation { createComment(token: {
//         post: "${post._id}",
//         parent: "${rootComment._id}",
//         content: "Reply comment",
//         public: true
//       }) { _id } }`
//     );

//     assert(rootComment);
//     assert(childComment);
//     replyComment = childComment;
//   });

//   it('did allow an admin to see the comments', async function() {
//     const { data: c1 } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${root._id}" ) { _id } }`
//     );
//     const { data: c2 } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${rootChild._id}" ) { _id } }`
//     );
//     const { data: c3 } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${replyComment._id}" ) { _id } }`
//     );

//     assert(c1);
//     assert(c2);
//     assert(c3);
//   });

//   it('did remove the new user', async function() {
//     const { data: userRemoved } = await newUserAgent.graphql<boolean>(
//       `mutation { removeUser( username: "${newUser.username}" ) }`
//     );
//     assert(userRemoved);
//   });

//   it('did remove the new users root comment & root reply', async function() {
//     const { data: c1 } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${root._id}" ) { _id } }`
//     );
//     const { data: c2 } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${rootChild._id}" ) { _id } }`
//     );
//     assert.deepEqual(c1, null);
//     assert.deepEqual(c2, null);
//   });

//   it('did not remove the reply comment, but did nullify the user property', async function() {
//     const { data: comment } = await header.admin.graphql<IComment<'expanded'>>(
//       `{ getComment( id: "${replyComment._id}" ) { author, user { _id } } }`
//     );

//     assert.deepEqual(comment.user, null);
//     assert.deepEqual(comment.author, 'user3');
//   });
// });
