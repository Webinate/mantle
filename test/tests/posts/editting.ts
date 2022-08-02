import * as assert from 'assert';
import header from '../header';
import { generateRandString } from '../../../src/utils/utils';
import ControllerFactory from '../../../src/core/controller-factory';
import { ADD_POST, UPDATE_POST, GET_POST, REMOVE_POST } from '../../client/requests/posts';
import { Post, AddPostInput, UpdatePostInput } from '../../../src/index';

let numPosts: number, secondPostId: string;
let post: Post;

const randomSlug = generateRandString(10);

describe('Testing editing of posts', function() {
  it('fetched all posts', async function() {
    const { count } = await ControllerFactory.get('posts').getPosts({});
    // const { data: page } = await header.admin.graphql<Page<Post>>(`{ getPosts { count } }`);
    numPosts = count;
  });

  it('did create a post to test editting post data', async function() {
    const { data: newPost } = await header.admin.graphql<Post>(ADD_POST, {
      token: <AddPostInput>{
        title: 'Simple Test',
        slug: randomSlug,
        public: true
      }
    });
    post = newPost;
    assert(newPost._id);
  });

  it('did create a second post to test editting post data', async function() {
    const { data: newPost } = await header.admin.graphql<Post>(ADD_POST, {
      token: <AddPostInput>{
        title: 'Simple Test',
        slug: generateRandString(10),
        public: true
      }
    });
    secondPostId = newPost._id;
    assert(secondPostId);
  });

  it('cannot edit a post with an invalid ID', async function() {
    const { errors } = await header.admin.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: 'woohoo',
        title: 'Simple Test 3'
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "woohoo" at "token._id"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer'
    );
  });

  it('cannot edit a post with an valid ID but doesnt exist', async function() {
    const { errors } = await header.admin.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: '123456789012345678901234',
        title: 'Simple Test 3'
      }
    });

    assert.deepEqual(errors![0].message, 'Could not find resource');
  });

  it('cannot edit a post without permission', async function() {
    const { errors } = await header.guest.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: post._id,
        title: 'Simple Test 3'
      }
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('cannot change an existing post with a slug already in use', async function() {
    const { errors } = await header.admin.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: secondPostId,
        slug: randomSlug
      }
    });

    assert.deepEqual(errors![0].message, 'Slug must be unique');
  });

  it('can change a post slug with a slug already in use, if its the same post', async function() {
    const { data: updatedPost } = await header.admin.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: post._id,
        slug: randomSlug
      }
    });

    assert.deepEqual(updatedPost._id, post._id);
    assert.deepEqual(updatedPost.slug, randomSlug);
    assert.deepEqual(updatedPost.title, 'Simple Test');
  });

  it('can edit a post with valid details', async function() {
    const { data: updatedPost } = await header.admin.graphql<Post>(UPDATE_POST, {
      token: <UpdatePostInput>{
        _id: post._id,
        brief: 'Updated'
      }
    });

    assert.deepEqual(updatedPost._id, post._id);
    assert.deepEqual(updatedPost.brief, 'Updated');

    // Ensure the doc and draft are returned
    assert(typeof updatedPost.document._id === 'string');
    assert(updatedPost.document.elements!.length > 0);
    assert.deepEqual(typeof updatedPost.latestDraft!._id, 'string');
    assert.deepEqual(updatedPost.latestDraft!.html.main, '<p></p>');
  });

  it('did update the posts modified property', async function() {
    const { data: json } = await header.admin.graphql<Post>(GET_POST, { id: post._id });

    // Creation date should be the same
    assert.deepEqual(json.createdOn, post.createdOn);

    // Modified date should be greater than creation
    assert(json.lastUpdated > json.createdOn);
  });

  it('did cleanup the test post', async function() {
    const { data: postRemoved } = await header.admin.graphql<boolean>(REMOVE_POST, { id: post._id });
    assert.deepEqual(postRemoved, true);
  });

  it('did cleanup the second test post', async function() {
    const { data: postRemoved } = await header.admin.graphql<boolean>(REMOVE_POST, { id: secondPostId });
    assert.deepEqual(postRemoved, true);
  });

  it('has cleaned up the posts successfully', async function() {
    const { count } = await ControllerFactory.get('posts').getPosts({});
    assert(count === numPosts);
  });
});
