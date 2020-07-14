import * as assert from 'assert';
import { IPost, IComment, Page, IAdminUser, IUserEntry } from '../../../../src';
import header from '../../header';
import { randomString } from '../../utils';
import ControllerFactory from '../../../../src/core/controller-factory';
import { GET_COMMENTS } from '../../../../src/graphql/client/requests/comments';
import { CommentSortType, SortOrder } from '../../../../src/core/enums';

let post: IPost<'server'>, comment1: IComment<'server'>, comment2: IComment<'server'>, admin: IUserEntry<'server'>;

describe('[GQL] Testing of fetching sorted comments:', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    const comments = ControllerFactory.get('comments');
    const posts = ControllerFactory.get('posts');
    admin = (await users.getUser({ username: (header.config.adminUser as IAdminUser).username })) as IUserEntry<
      'server'
    >;
    post = await posts.create({ title: 'test', author: admin._id, slug: randomString() });
    comment1 = await comments.create({
      post: post._id,
      author: admin.username as string,
      user: admin._id,
      content: 'AAA'
    });

    comment2 = await comments.create({
      post: post._id,
      author: admin.username as string,
      user: admin._id,
      content: 'BBBB'
    });

    // Modify comment 1
    comment1 = await comments.update(comment1._id, { content: 'AAAA' });
  });

  it('gets comments filtered by creation date by default', async function() {
    const response = await header.admin.graphql<Page<IComment<'expanded'>>>(GET_COMMENTS, {});

    assert.deepEqual(response.data.data[0]._id, comment2._id.toString());
    assert.deepEqual(response.data.data[1]._id, comment1._id.toString());
  });

  it('can filter by date modified (desc)', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(GET_COMMENTS, {
      sortOrder: SortOrder.desc,
      sortType: CommentSortType.updated
    });

    assert.deepEqual(data[0]._id, comment1._id.toString());
    assert.deepEqual(data[1]._id, comment2._id.toString());
  });

  it('can filter by date modified (asc)', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(GET_COMMENTS, {
      sortOrder: SortOrder.asc,
      sortType: CommentSortType.updated,
      limit: -1
    });

    assert.deepEqual(data[data.length - 1]._id, comment1._id.toString());
    assert.deepEqual(data[data.length - 2]._id, comment2._id.toString());
  });

  after(async function() {
    const comments = ControllerFactory.get('comments');
    const posts = ControllerFactory.get('posts');
    await comments.remove(comment1._id);
    await comments.remove(comment2._id);
    await posts.removePost(post._id);
  });
});
