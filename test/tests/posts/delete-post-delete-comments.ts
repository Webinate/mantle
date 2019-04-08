import * as assert from 'assert';
import { IPost, Page, IComment } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';

let post: IPost<'expanded'>, comment1: IComment<'expanded'>, comment2: IComment<'expanded'>;

describe('Testing deletion of comments when a post is deleted', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const comments = ControllerFactory.get('comments');
    const users = ControllerFactory.get('users');

    const admin = await users.getUser({ username: header.admin.username });
    const user1 = await users.getUser({ username: header.user1.username });

    // Create post and comments
    post = (await posts.create({
      author: admin._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'expanded'>;

    comment1 = (await comments.create({
      author: user1._id,
      post: post._id,
      content: 'parent comment',
      public: true
    })) as IComment<'expanded'>;

    comment2 = (await comments.create({
      author: user1._id,
      post: post._id,
      content: 'parent comment',
      parent: comment1._id,
      public: true
    })) as IComment<'expanded'>;
  });

  it('get two comments for a post', async function() {
    const resp = await header.user1.get(`/api/comments?postId=${post._id}`);
    assert.strictEqual(resp.status, 200);
    const page = await resp.json<Page<IComment<'client'>>>();
    assert.strictEqual(page.count, 2);
    assert.strictEqual(page.data[0]._id, comment2._id);
    assert.strictEqual(page.data[1]._id, comment1._id);
  });

  it('deleted the post', async function() {
    const resp = await header.admin.delete(`/api/posts/${post._id}`);
    assert.strictEqual(resp.status, 204);
  });

  it('did delete the 2 comments of the post', async function() {
    let resp = await header.user1.get(`/api/comments?postId=${post._id}`);
    assert.strictEqual(resp.status, 200);
    const page = await resp.json<Page<IComment<'client'>>>();
    assert.strictEqual(page.count, 0);

    resp = await header.user1.get(`/api/comments/${comment1._id}`);
    assert.strictEqual(resp.status, 500);
  });
});
