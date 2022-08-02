import * as assert from 'assert';
import header from '../header';
import { generateRandString } from '../../../src/utils/utils';
import { GET_POSTS, ADD_POST, REMOVE_POST } from '../../client/requests/posts';
import { GET_DOCUMENT } from '../../client/requests/documents';
import { Post, Document, AddPostInput, PaginatedPostsResponse } from '../../../src/index';

let numPosts: number, post: Post;

describe('Testing deletion of posts', function() {
  it('fetched all posts', async function() {
    const resp = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS);
    resp;

    const {
      data: { count }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS);

    numPosts = count;
  });

  it('did create a post to test deletion', async function() {
    const { data: newPost } = await header.admin.graphql<Post>(ADD_POST, {
      token: <AddPostInput>{
        title: 'Simple Test',
        slug: generateRandString(10),
        public: true
      }
    });

    assert(newPost);
    post = newPost;
  });

  it('cannot delete a post with invalid ID format', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_POST, { id: 'WRONGWRONGWRONG' });
    assert.strictEqual(
      errors![0].message,
      'Variable "$id" got invalid value "WRONGWRONGWRONG"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer'
    );
  });

  it('cannot delete a post with invalid ID', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_POST, { id: '123456789012345678901234' });
    assert.strictEqual(errors![0].message, 'Could not find post');
  });

  it('cannot delete a post without permission', async function() {
    const { errors } = await header.guest.graphql<boolean>(REMOVE_POST, { id: post._id });
    assert.strictEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('can delete a post with valid ID & admin permissions', async function() {
    const { data: removed } = await header.admin.graphql<boolean>(REMOVE_POST, { id: post._id });
    assert(removed);
  });

  it('has removed the document', async function() {
    const { data, errors } = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document._id });
    assert(!data);
    assert(!errors);
  });

  it('has cleaned up the posts successfully', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<PaginatedPostsResponse>(GET_POSTS);
    assert(count === numPosts);
  });
});
