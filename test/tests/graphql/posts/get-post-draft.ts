// import * as assert from 'assert';
// import { IPost, Page, IFileEntry, IVolume, IDocument, IDraftElement, IImageElement, IDraft } from '../../../../src';
// import header from '../../header';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { uploadFileToVolume } from '../../file';
// import { randomString } from '../../utils';

// let volume: IVolume<'expanded'>;
// let post: IPost<'expanded'>;
// let file: IFileEntry<'expanded'>;
// let firstDraft: IDraft<'expanded'>;

// let updatedHTML: string, listHTML: string, imgHTML: string, codeHtml: string, drafts: IDraft<'expanded'>[];

// describe('[GQL] Testing of posts and drafts', function() {
//   before(async function() {
//     const users = ControllerFactory.get('users');
//     const volumes = ControllerFactory.get('volumes');
//     const posts = ControllerFactory.get('posts');

//     const user = await users.getUser({ username: header.admin.username });
//     volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'expanded'>;
//     file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'expanded'>;
//     post = (await posts.create({
//       author: user._id,
//       slug: randomString(),
//       title: 'Temp Post',
//       public: true
//     })) as IPost<'expanded'>;
//   });

//   after(async function() {
//     const volumes = ControllerFactory.get('volumes');
//     const posts = ControllerFactory.get('posts');
//     await volumes.remove({ _id: volume._id });
//     await posts.removePost(post._id);
//   });

//   it('can fetch a single post and there is no draft initially', async function() {
//     let { data: fetchedPost } = await header.admin.graphql<IPost<'expanded'>>(
//       `{ getPost( id: "${post._id}" ) {
//         document {
//           _id
//         }
//         latestDraft {
//           _id
//         }
//       }}`
//     );

//     assert.deepEqual(fetchedPost.latestDraft, null);
//     assert.deepEqual(typeof fetchedPost.document._id, 'string');
//   });

//   it('can publish the post document with elements and latest draft is updated', async function() {
//     updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
//     listHTML = '<ul><li>Test 1</li><li>Test 2</li></ul>';
//     imgHTML = `<figure><img src="${file.publicURL!}" /></figure>`;

//     const { data: updatedElement1 } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { updateDocElement( id: "${post.document._id}", elementId: "${
//         post.document.elements[0]._id
//       }", token: { html: "${updatedHTML}" } ) { _id }}`
//     );

//     const { data: newListElement } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement( id: "${post.document._id}", token: { type: ElmList, html: "${listHTML}" } ) { _id }}`
//     );

//     const { data: newImgElement } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement( id: "${post.document._id}", token: { type: ElmImage, image: "${file._id}" } ) { _id }}`
//     );

//     assert(updatedElement1._id);
//     assert(newListElement._id);
//     assert(newImgElement._id);

//     const { data: updatedPost } = await header.admin.graphql<IPost<'expanded'>>(
//       `mutation { updatePost( token: { _id: "${post._id}", public: true } ) {
//         latestDraft {
//           _id
//           html
//         }
//         document {
//           _id
//         }
//       }}`
//     );

//     assert.deepEqual(typeof updatedPost.latestDraft._id, 'string');
//     assert.deepEqual(typeof updatedPost.document._id, 'string');
//     assert.deepEqual(updatedPost.latestDraft.html.main, updatedHTML + listHTML + imgHTML);

//     firstDraft = updatedPost.latestDraft;
//   });

//   it('does create a new draft with more changes', async function() {
//     codeHtml = `<pre>Hello world</pre>`;

//     const { data: newElement } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement( id: "${post.document._id}", token: { type: ElmCode, html: "${codeHtml}" } ) { _id }}`
//     );

//     const { data: updatedPost } = await header.admin.graphql<IPost<'expanded'>>(
//       `mutation { updatePost( token: { _id: "${post._id}", public: true } ) { _id, latestDraft { _id, html } }}`
//     );

//     assert(newElement._id);
//     assert(updatedPost._id);

//     assert.deepEqual(typeof updatedPost.latestDraft._id, 'string');
//     assert.notDeepEqual(typeof updatedPost.latestDraft._id, firstDraft._id);
//     assert.deepEqual(updatedPost.latestDraft.html.main, updatedHTML + listHTML + imgHTML + codeHtml);
//   });

//   it('prevents guests from getting post draft lists', async function() {
//     const { errors } = await header.guest.graphql<IDraft<'expanded'>[]>(
//       `{ getPostDrafts( id: "${post.document._id}" ) { _id }}`
//     );

//     assert.deepEqual(errors[0].message, 'Authentication Error');
//   });

//   it('prevents getting post draft lists with a bad id', async function() {
//     const { errors } = await header.admin.graphql<IDraft<'expanded'>[]>(`{ getPostDrafts( id: "BAD" ) { _id }}`);

//     assert.deepEqual(
//       errors[0].message,
//       'Expected type ObjectId, found "BAD"; ObjectId must be a single String of 24 hex characters'
//     );
//   });

//   it('prevents other users from getting post draft lists', async function() {
//     const { errors } = await header.user1.graphql<IDraft<'expanded'>[]>(
//       `{ getPostDrafts( id: "${post._id}" ) { _id }}`
//     );

//     assert.deepEqual(errors[0].message, 'You do not have permission');
//   });

//   it('allows an admin to get post draft lists', async function() {
//     const { data } = await header.admin.graphql<IDraft<'expanded'>[]>(
//       `{ getPostDrafts( id: "${post._id}" ) { _id, html }}`
//     );

//     drafts = data;
//     assert.deepEqual(drafts.length, 3);
//     assert.deepEqual(drafts[1].html.main, updatedHTML + listHTML + imgHTML);
//     assert.deepEqual(drafts[2].html.main, updatedHTML + listHTML + imgHTML + codeHtml);
//   });

//   it('prevents removing a post draft with a bad id', async function() {
//     const { errors } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "BAD", draftId: "BAD" ) }`
//     );

//     assert.deepEqual(
//       errors[0].message,
//       'Expected type ObjectId!, found "BAD"; ObjectId must be a single String of 24 hex characters'
//     );
//     assert.deepEqual(
//       errors[1].message,
//       'Expected type ObjectId!, found "BAD"; ObjectId must be a single String of 24 hex characters'
//     );
//   });

//   it('prevents removing a post draft with a post that doesnt exist', async function() {
//     const { errors } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "123456789012345678901234", draftId: "123456789012345678901234" ) }`
//     );

//     assert.deepEqual(errors[0].message, 'Post does not exist');
//   });

//   it('prevents removing a post draft with a draft that does not exist', async function() {
//     const { errors } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "123456789012345678901234" ) }`
//     );

//     assert.deepEqual(errors[0].message, 'Draft does not exist');
//   });

//   it('prevents removing a post draft with no authentication', async function() {
//     const { errors } = await header.guest.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "${drafts[0]._id}" ) }`
//     );

//     assert.deepEqual(errors[0].message, 'Authentication Error');
//   });

//   it('prevents removing a post draft without admin rights', async function() {
//     const { errors } = await header.user1.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "${drafts[0]._id}" ) }`
//     );

//     assert.deepEqual(errors[0].message, 'You do not have permission');
//   });

//   it('does allow an admin to remove the first draft', async function() {
//     const { data: wasRemoved } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "${drafts[0]._id}" ) }`
//     );

//     assert(wasRemoved);

//     const { data: data } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "${drafts[0]._id}" ) }`
//     );

//     const { data: newDrafts } = await header.admin.graphql<IDraft<'expanded'>[]>(
//       `{ getPostDrafts( id: "${post._id}" ) { _id, html }}`
//     );

//     assert.deepEqual(newDrafts.length, 2);
//     assert.deepEqual(newDrafts[0].html.main, updatedHTML + listHTML + imgHTML);
//     assert.deepEqual(newDrafts[1].html.main, updatedHTML + listHTML + imgHTML + codeHtml);
//   });

//   it('does allow an admin to the current draft and the post draft is nullified', async function() {
//     const { data: wasRemoved } = await header.admin.graphql<boolean>(
//       `mutation { removePostDraft( postId: "${post._id}", draftId: "${drafts[2]._id}" ) }`
//     );

//     assert(wasRemoved);

//     const { data: newDrafts } = await header.admin.graphql<IDraft<'expanded'>[]>(
//       `{ getPostDrafts( id: "${post._id}" ) { _id, html }}`
//     );

//     assert.deepEqual(newDrafts.length, 1);
//     assert.deepEqual(newDrafts[0].html.main, updatedHTML + listHTML + imgHTML);

//     // Now check that the post's draft is nullified
//     const { data: fetchedPost } = await header.admin.graphql<IPost<'expanded'>>(
//       `{ getPost( id: "${post._id}" ) { _id, latestDraft { _id } }}`
//     );

//     assert.deepEqual(fetchedPost.latestDraft, null);
//   });
// });
