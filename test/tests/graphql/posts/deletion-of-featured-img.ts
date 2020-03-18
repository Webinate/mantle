// import * as assert from 'assert';
// import { IPost, IVolume, IFileEntry } from '../../../../src';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { randomString } from '../../utils';
// import header from '../../header';
// import * as fs from 'fs';
// import * as FormData from 'form-data';
// import { postFragment } from '../fragments';

// let post: IPost<'expanded'>, volume: IVolume<'expanded'>, file: IFileEntry<'expanded'>;

// describe('[GQL] Testing deletion of a featured image nullifies it on the post: ', function() {
//   before(async function() {
//     const posts = ControllerFactory.get('posts');
//     const users = ControllerFactory.get('users');

//     await header.createUser('user3', 'password', 'user3@test.com', 'admin');
//     const user3 = await users.getUser({ username: 'user3' });

//     // Create post and comments
//     post = (await posts.create({
//       author: user3!._id,
//       slug: randomString(),
//       title: 'Temp Post',
//       public: true
//     })) as IPost<'expanded'>;

//     const resp = await header.user3.post(`/volumes`, { name: randomString() });
//     const json = await resp.json<IVolume<'expanded'>>();
//     assert.deepEqual(resp.status, 200);
//     volume = json;
//   });

//   after(async function() {
//     const posts = ControllerFactory.get('posts');
//     await posts.removePost(post._id);

//     const resp = await header.user3.delete(`/volumes/${volume._id}`);
//     assert.deepEqual(resp.status, 204);
//   });

//   it('did upload a single file', async function() {
//     const form = new FormData();
//     const filePath = './test/media/file.png';
//     form.append('good-file', fs.createReadStream(filePath));
//     const resp = await header.user3.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
//     assert.equal(resp.status, 200);
//     const files = await resp.json<IFileEntry<'expanded'>[]>();
//     assert.equal(files.length, 1);
//     file = files[0];
//   });

//   it('did does throw an error when updating a post with an invalid featured img id', async function() {
//     const { errors } = await header.user3.graphql<IPost<'expanded'>>(`mutation { updatePost(token: {
//       _id: "${post._id}"
//       featuredImage: "BAD"
//     }) { ...PostFields, featuredImage { _id } } } ${postFragment}`);

//     assert.deepEqual(
//       errors[0].message,
//       'Expected type ObjectId, found "BAD"; ObjectId must be a single String of 24 hex characters'
//     );
//   });

//   it('did does throw an error when updating a post when featured img does not exist', async function() {
//     const { errors } = await header.user3.graphql<IPost<'expanded'>>(`mutation { updatePost(token: {
//       _id: "${post._id}"
//       featuredImage: "123456789012345678901234"
//     }) { ...PostFields, featuredImage { _id } } } ${postFragment}`);

//     assert.deepEqual(errors[0].message, `File '123456789012345678901234' does not exist`);
//   });

//   it('did update the post with the file as a featured image', async function() {
//     const { data: updatedPost } = await header.user3.graphql<IPost<'expanded'>>(`mutation { updatePost(token: {
//       _id: "${post._id}"
//       featuredImage: "${file._id}"
//     }) { ...PostFields, featuredImage { _id } } } ${postFragment}`);
//     assert.equal(updatedPost.featuredImage._id, file._id);
//   });

//   it('did get the featured image when we get the post resource', async function() {
//     const { data: postResponse } = await header.user3.graphql<IPost<'expanded'>>(`{ getPost( id: "${post._id}") {
//       ...PostFields, featuredImage { _id } } } ${postFragment}`);
//     assert.deepEqual(postResponse.featuredImage._id, file._id);
//   });

//   it('did delete the uploaded file', async function() {
//     const { data: postRemoved } = await header.user3.graphql<boolean>(`mutation { removeFile(id: "${file._id}") }`);
//     assert(postRemoved);
//   });

//   it('did nullify the featured image on the post', async function() {
//     const { data: postResponse } = await header.user3.graphql<IPost<'expanded'>>(`{ getPost( id: "${post._id}") {
//       ...PostFields, featuredImage { _id } } } ${postFragment}`);
//     assert.deepEqual(postResponse.featuredImage, null);
//   });
// });
