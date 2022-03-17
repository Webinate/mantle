import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { GET_POST } from '../../client/requests/posts';
import { REMOVE_USER } from '../../client/requests/users';
import { Post } from '../../../src/index';
import { IPost, IUserEntry } from '../../../src/types';

let post: IPost<'server'>, newUser: IUserEntry<'server'>;

describe('Testing deletion of user is nullified on posts: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');

    await header.createUser('user3', 'password', 'user3@test.com', 'admin');
    newUser = (await users.getUser({ username: 'user3' })) as IUserEntry<'server'>;

    // Create post and comments
    post = (await posts.create({
      author: newUser._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'server'>;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('can get a post with the created user', async function() {
    const resp = await header.user1.graphql<Post>(GET_POST, { id: post._id });

    assert.deepEqual(resp.data.author!._id, newUser._id.toString());
  });

  it('can delete the new user', async function() {
    const { data: userRemoved } = await header.admin.graphql<boolean>(REMOVE_USER, { username: newUser.username });
    assert(userRemoved);
  });

  it('did nullify the user from the post', async function() {
    const resp = await header.user1.graphql<Post>(GET_POST, { id: post._id });

    assert.deepEqual(resp.data.author, null);
  });
});
