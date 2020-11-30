import * as assert from 'assert';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { ADD_COMMENT } from '../../../src/graphql/client/requests/comments';
import { Comment, AddCommentInput } from '../../../src/index';
import { IPost } from '../../../src/types/models/i-post';
import controllerFactory from '../../../src/core/controller-factory';

let numPosts: number, numComments: number, newPost: IPost<'server'>, commentId: string;

describe('Testing creation of comments', function() {
  before(async function() {
    const postResp = await ControllerFactory.get('posts').getPosts({});
    const commentResp = await ControllerFactory.get('comments').getAll({});
    newPost = await ControllerFactory.get('posts').create({
      title: 'Simple Test',
      slug: header.makeid(),
      brief: 'This is brief',
      public: false
    });

    assert.ok(newPost);

    numPosts = postResp.count;
    numComments = commentResp.count;
  });

  after(async function() {
    await ControllerFactory.get('posts').removePost(newPost._id);
    const postResp = await ControllerFactory.get('posts').getPosts({});
    const commentResp = await ControllerFactory.get('comments').getAll({});

    assert.equal(numPosts, postResp.count);
    assert.equal(numComments, commentResp.count);
  });

  it('cannot create a comment when not logged in', async function() {
    const resp = await header.guest.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: '123456789012345678901234',
        content: ''
      }
    });

    assert.deepEqual(resp.errors![0].message, `Access denied! You don\'t have permission for this action!`);
  });

  it('cannot create a comment with a badly formatted post id', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: 'bad',
        parent: 'bad'
      }
    });

    assert.deepEqual(
      resp.errors![0].message,
      'Variable "$token" got invalid value "bad" at "token.post"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
    assert.deepEqual(
      resp.errors![1].message,
      'Variable "$token" got invalid value "bad" at "token.parent"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('cannot create a comment without a post that actually exists', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: '123456789012345678901234',
        content: ''
      }
    });

    assert.deepEqual(resp.errors![0].message, 'No post exists with the id 123456789012345678901234');
  });

  it('cannot create a comment without a parent that actually exists', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: '123456789012345678901234',
        parent: '123456789012345678901234',
        content: ''
      }
    });

    assert.deepEqual(resp.errors![0].message, 'No comment exists with the id 123456789012345678901234');
  });

  it('cannot create a comment with illegal html', async function() {
    let resp = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: newPost._id,
        content: `Hello world! __filter__ <script type=\'text/javascript\'>alert\('BOOO')</script>`
      }
    });

    assert.deepEqual(resp.errors![0].message, `Validation error for content: `);

    resp = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: newPost._id,
        content: `Hello world! __filter__ <div>No no no</div>`
      }
    });

    assert.deepEqual(resp.errors![0].message, `Validation error for content: `);
  });

  it('can create a comment on a valid post', async function() {
    const resp = await header.admin.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: newPost._id,
        content: `Hello world! __filter__`,
        public: false
      }
    });

    const newComment = resp.data;
    commentId = newComment._id;
    assert(newComment._id);
    assert(newComment.author);
    assert.deepEqual(newComment.post._id, newPost._id.toString());
    assert.deepEqual(newComment.content, 'Hello world! __filter__');
    assert(newComment.children.length === 0);
    assert(newComment.public === false);
    assert(newComment.createdOn);
    assert(newComment.lastUpdated);
  });

  it('can create a another comment on the same post, with a parent comment', async function() {
    const { data: _id } = await header.admin.graphql<{ _id: string }>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: newPost._id,
        parent: commentId,
        content: `Hello world! __filter__`,
        public: false
      }
    });

    assert(_id);
  });

  it('allows an admin to create another users comment, but not the other way around', async function() {
    const user1 = await controllerFactory.get('users').getUser({ username: header.user1.username });
    const user2 = await controllerFactory.get('users').getUser({ username: header.user2.username });
    assert.ok(user1);

    let resp = await header.admin.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        user: user1?._id,
        post: newPost._id,
        parent: commentId,
        content: `Hello world! __filter__`,
        public: false
      }
    });

    // Admin allowed to set user
    assert.deepStrictEqual(resp.data.author, user1?.username);

    // Cleanup
    await controllerFactory.get('comments').remove(resp.data._id);

    // Non-admin not allowed to create comment for other user
    resp = await header.user1.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        user: user2?._id,
        post: newPost._id,
        parent: commentId,
        content: `Hello world! __filter__`,
        public: false
      }
    });

    assert.deepStrictEqual(resp.data.author, user1?.username);

    // Cleanup
    await controllerFactory.get('comments').remove(resp.data._id);
  });
});
