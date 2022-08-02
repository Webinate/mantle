import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../client/requests/volume';
import { UPDATE_POST, GET_POST } from '../../client/requests/posts';
import { AddVolumeInput } from '../../../src/graphql/models/volume-type';
import { UpdatePostInput } from '../../../src/graphql/models/post-type';
import { REMOVE_FILE } from '../../client/requests/file';
import { Post, Volume } from '../../../src/index';
import { IPost, IFileEntry } from '../../../src/types';

let post: IPost<'server'>, volume: Volume, file: IFileEntry<'expanded'>;

describe('Testing deletion of a featured image nullifies it on the post: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');

    await header.createUser('user3', 'password', 'user3@test.com', 'admin');
    const user3 = await users.getUser({ username: 'user3' });

    // Create post and comments
    post = (await posts.create({
      author: user3!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'server'>;

    const resp = await header.user3.graphql<Volume>(ADD_VOLUME, {
      token: new AddVolumeInput({ name: randomString(), user: user3!._id })
    });

    assert.ok(!resp.errors);
    volume = resp.data;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);

    const resp = await header.user3.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.deepEqual(resp.data, true);
  });

  it('did upload a single file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.user3.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files: IFileEntry<'expanded'>[] = await resp.json();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did does throw an error when updating a post with an invalid featured img id', async function() {
    const { errors } = await header.user3.graphql<Post>(UPDATE_POST, {
      token: new UpdatePostInput({
        _id: post._id,
        featuredImage: 'BAD' as any
      })
    });

    assert.deepEqual(
      errors![0].message,
      `Variable "$token" got invalid value "BAD" at "token.featuredImage"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer`
    );
  });

  it('did does throw an error when updating a post when featured img does not exist', async function() {
    const { errors } = await header.user3.graphql<Post>(UPDATE_POST, {
      token: new UpdatePostInput({
        _id: post._id,
        featuredImage: '123456789012345678901234'
      })
    });

    assert.deepEqual(errors![0].message, `File '123456789012345678901234' does not exist`);
  });

  it('did update the post with the file as a featured image', async function() {
    const { data: updatedPost } = await header.user3.graphql<Post>(UPDATE_POST, {
      token: new UpdatePostInput({
        _id: post._id,
        featuredImage: file._id
      })
    });

    assert.equal(updatedPost!.featuredImage!._id, file._id);
  });

  it('did get the featured image when we get the post resource', async function() {
    const { data: postResponse } = await header.user3.graphql<Post>(GET_POST, { id: post._id });
    assert.deepEqual(postResponse.featuredImage!._id, file._id);
  });

  it('did delete the uploaded file', async function() {
    const { data: postRemoved } = await header.user3.graphql<boolean>(REMOVE_FILE, { id: file._id });
    assert(postRemoved);
  });

  it('did nullify the featured image on the post', async function() {
    const resp = await header.user3.graphql<Post>(GET_POST, { id: post._id });
    assert.deepEqual(resp.data.featuredImage, null);
  });
});
