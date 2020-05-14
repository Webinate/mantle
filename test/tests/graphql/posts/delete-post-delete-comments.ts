import * as assert from 'assert';
import { IPost, Page, IComment } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { GET_COMMENTS, GET_COMMENT } from '../../../../src/graphql/client/requests/comments';
import { GetCommentsArgs } from '../../../../src/graphql/models/comment-type';
import { REMOVE_POST } from '../../../../src/graphql/client/requests/posts';

let post: IPost<'server'>, comment1: IComment<'server'>, comment2: IComment<'server'>;

describe('[GQL] Testing deletion of comments when a post is deleted', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const comments = ControllerFactory.get('comments');
    const users = ControllerFactory.get('users');

    const admin = await users.getUser({ username: header.admin.username });
    const user1 = await users.getUser({ username: header.user1.username });

    // Create post and comments
    post = (await posts.create({
      author: admin!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'server'>;

    comment1 = (await comments.create({
      user: user1!._id,
      post: post._id,
      content: 'parent comment',
      public: true
    })) as IComment<'server'>;

    comment2 = (await comments.create({
      user: user1!._id,
      post: post._id,
      content: 'parent comment',
      parent: comment1._id,
      public: true
    })) as IComment<'server'>;
  });

  it('get two comments for a post', async function() {
    const { data } = await header.user1.graphql<Page<IPost<'expanded'>>>(
      GET_COMMENTS,
      new GetCommentsArgs({
        postId: post._id
      })
    );

    assert.strictEqual(data.count, 2);
    assert.strictEqual(data.data[0]._id, comment2._id.toString());
    assert.strictEqual(data.data[1]._id, comment1._id.toString());
  });

  it('deleted the post', async function() {
    const { data } = await header.admin.graphql<boolean>(REMOVE_POST, { id: post._id });
    assert(data);
  });

  it('did delete the 2 comments of the post', async function() {
    const {
      data: { count }
    } = await header.user1.graphql<Page<IComment<'client'>>>(
      GET_COMMENTS,
      new GetCommentsArgs({
        postId: post._id
      })
    );
    assert.strictEqual(count, 0);

    const { data } = await header.user1.graphql<IComment<'client'>>(GET_COMMENT, { id: comment1._id });
    assert.deepEqual(data, null);
  });
});
