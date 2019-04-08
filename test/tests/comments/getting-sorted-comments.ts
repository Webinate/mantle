import * as assert from 'assert';
import { IPost, IComment, Page, IAdminUser, IUserEntry } from '../../../src';
import header from '../header';
import { randomString } from '../utils';
import ControllerFactory from '../../../src/core/controller-factory';

let post: IPost<'expanded'>,
  comment1: IComment<'expanded'>,
  comment2: IComment<'expanded'>,
  admin: IUserEntry<'expanded'>;

describe('Testing of fetching sorted comments:', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    const comments = ControllerFactory.get('comments');
    const posts = ControllerFactory.get('posts');
    admin = (await users.getUser({ username: (header.config.adminUser as IAdminUser).username })) as IUserEntry<
      'expanded'
    >;
    post = (await posts.create({ title: 'test', author: admin._id, slug: randomString() })) as IPost<'expanded'>;
    comment1 = (await comments.create({
      post: post._id,
      author: admin.username,
      user: admin._id,
      content: 'AAA'
    })) as IComment<'expanded'>;
    comment2 = (await comments.create({
      post: post._id,
      author: admin.username,
      user: admin._id,
      content: 'BBBB'
    })) as IComment<'expanded'>;

    // Modify comment 1
    comment1 = (await comments.update(comment1._id, { content: 'AAAA' })) as IComment<'expanded'>;
  });

  it('gets comments filtered by creation date by default', async function() {
    const resp = await header.admin.get(`/api/comments`);
    assert.deepEqual(resp.status, 200);
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual(comments.data[0]._id, comment2._id);
    assert.deepEqual(comments.data[1]._id, comment1._id);
  });

  it('can filter by date modified (desc)', async function() {
    const resp = await header.admin.get(`/api/comments?sortOrder=desc&sortType=updated`);
    assert.deepEqual(resp.status, 200);
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual(comments.data[0]._id, comment1._id);
    assert.deepEqual(comments.data[1]._id, comment2._id);
  });

  it('can filter by date modified (asc)', async function() {
    const resp = await header.admin.get(`/api/comments?sortOrder=asc&sortType=updated&limit=-1`);
    assert.deepEqual(resp.status, 200);
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual(comments.data[comments.data.length - 1]._id, comment1._id);
    assert.deepEqual(comments.data[comments.data.length - 2]._id, comment2._id);
  });

  after(async function() {
    const comments = ControllerFactory.get('comments');
    const posts = ControllerFactory.get('posts');
    await comments.remove(comment1._id);
    await comments.remove(comment2._id);
    await posts.removePost(post._id);
  });
});
