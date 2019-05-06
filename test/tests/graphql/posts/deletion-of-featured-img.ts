import * as assert from 'assert';
import { IPost, IVolume, IFileEntry } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import * as fs from 'fs';
import * as FormData from 'form-data';

let post: IPost<'expanded'>, volume: IVolume<'expanded'>, file: IFileEntry<'expanded'>;

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
    })) as IPost<'expanded'>;

    const resp = await header.user3.post(`/volumes`, { name: randomString() });
    const json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual(resp.status, 200);
    volume = json;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);

    const resp = await header.user3.delete(`/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 204);
  });

  it('did upload a single file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append('good-file', fs.createReadStream(filePath));
    form.append('query', `mutation { uploadFile( volumeId: "${volume._id}") { _id }`);

    const resp = await header.user3.post(`/graphql`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did update the post with the file as a featured image', async function() {
    const resp = await header.user3.put(`/api/posts/${post._id}`, { featuredImage: file._id } as IPost<'client'>);
    assert.equal(resp.status, 200);
    const updatedPost = await resp.json<IPost<'expanded'>>();
    assert.equal(updatedPost.featuredImage._id, file._id);
  });

  it('did get the featured image when we get the post resource', async function() {
    const resp = await header.user3.get(`/api/posts/${post._id}`);
    assert.equal(resp.status, 200);
    const postResponse = await resp.json<IPost<'expanded'>>();
    assert.deepEqual(postResponse.featuredImage._id, file._id);
  });

  it('did delete the uploaded file', async function() {
    const resp = await header.user3.delete(`/files/${file._id}`);
    assert.equal(resp.status, 204);
  });

  it('did nullify the featured image on the post', async function() {
    const resp = await header.user3.get(`/api/posts/${post._id}`);
    assert.equal(resp.status, 200);
    const postResponse = await resp.json<IPost<'expanded'>>();
    assert.deepEqual(postResponse.featuredImage, null);
  });
});
