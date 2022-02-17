import * as assert from 'assert';
import header from '../header';
import { randomString } from '../utils';
import ControllerFactory from '../../../src/core/controller-factory';
import { GET_POSTS, UPDATE_POST } from '../../client/requests/posts';
import { PaginatedPostsResponse, UpdatePostInput, QueryPostsArgs } from '../../../src/index';
import { IPost } from '../../../src/types/models/i-post';
import { IUserEntry } from '../../../src/types/models/i-user-entry';

let postPublic: IPost<'server'>, postPrivate: IPost<'server'>;

describe('Testing filtering of posts: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const admin = (await users.getUser({ username: header.admin.username })) as IUserEntry<'server'>;

    // Create post and comments
    postPublic = (await posts.create({
      author: admin!._id,
      title: randomString() + '_first',
      slug: randomString(),
      public: true
    })) as IPost<'server'>;

    postPrivate = (await posts.create({
      author: admin!._id,
      title: randomString() + '_second',
      slug: randomString(),
      public: false
    })) as IPost<'server'>;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(postPublic._id);
    await posts.removePost(postPrivate._id);
  });

  it('does filter by visibility status', async function() {
    let resp = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // Checks the order
    assert.equal(resp.data.data[0]._id, postPrivate._id);
    assert.equal(resp.data.data[1]._id, postPublic._id);

    resp = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'private',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // The first post should now be post 2, which is private
    assert.equal(resp.data.data[0]._id, postPrivate._id);

    resp = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'public',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // The first post should now be post 1, which is public
    assert.equal(resp.data.data[0]._id, postPublic._id);

    resp = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // If we specify all we get both posts
    assert.equal(resp.data.data[0]._id, postPrivate._id);
    assert.equal(resp.data.data[1]._id, postPublic._id);

    resp = await header.user1.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'private',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // Regular users cannot see private posts
    assert.equal(resp.data.data[0]._id, postPublic._id);
  });

  it('does filter by descending status', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    // If we specify all we get both posts
    assert.equal(data[0]._id, postPrivate._id);
    assert.equal(data[1]._id, postPublic._id);
  });

  it('does filter by ascending status', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'asc',
      sortType: 'created',
      limit: -1
    } as QueryPostsArgs);

    let lastIndex = data.length - 1;

    // If we specify all we get both posts
    assert.equal(data[lastIndex]._id, postPrivate._id);
    assert.equal(data[lastIndex - 1]._id, postPublic._id);
  });

  it('does filter by author', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      author: header.admin.username,
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    assert.equal(data[0]._id, postPrivate._id);

    const {
      data: { data: filtered }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      author: 'NO_AUTHORS_WITH_THIS_NAME',
      sortOrder: 'desc',
      sortType: 'created'
    } as QueryPostsArgs);

    assert.deepEqual(filtered.length, 0);
  });

  it('can filter based on modified in ascending order', async function() {
    const resp = await header.admin.graphql<IPost<'expanded'>>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: postPublic._id,
        brief: 'Updated'
      }
    });

    assert.ok(!resp.errors);

    const {
      data: { data }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'asc',
      sortType: 'modified',
      limit: -1
    } as QueryPostsArgs);

    let lastIndex = data.length - 1;

    // If we specify all we get both posts
    assert.equal(data[lastIndex]._id, postPublic._id);
    assert.equal(data[lastIndex - 1]._id, postPrivate._id);
  });

  it('can filter based on modified in descending order', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS, {
      visibility: 'all',
      sortOrder: 'desc',
      sortType: 'modified',
      limit: -1
    } as QueryPostsArgs);

    // If we specify all we get both posts
    assert.equal(data[0]._id, postPublic._id);
    assert.equal(data[1]._id, postPrivate._id);
  });
});
