import * as assert from 'assert';
import header from '../header';
import { randomString } from '../utils';
import { ADD_POST, REMOVE_POST } from '../../client/requests/posts';
import { ADD_COMMENT, GET_COMMENT, REMOVE_COMMENT } from '../../client/requests/comments';
import { Comment, AddCommentInput, Post, AddPostInput } from '../../../src/index';

let post: Post, parent: Comment, child1: Comment, child2: Comment;

describe('Testing the parent child relationship of comments: ', function() {
  before(async function() {
    const { data: newPost } = await header.admin.graphql<Post>(ADD_POST, {
      token: <AddPostInput>{
        slug: randomString(),
        title: 'Temp Post',
        public: true
      }
    });
    post = newPost;
    assert(newPost);
  });

  after(async function() {
    const { data: postRemoved } = await header.admin.graphql<boolean>(REMOVE_POST, {
      id: post._id
    });
    assert(postRemoved);
  });

  it('did create a parent comment', async function() {
    const { data: newComment } = await header.user1.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: post._id,
        content: 'Parent',
        public: true
      }
    });
    parent = newComment;
  });

  it('did create 2 children comments', async function() {
    const { data: newComment1 } = await header.user1.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: post._id,
        parent: parent._id,
        content: 'Child 1',
        public: true
      }
    });

    const { data: newComment2 } = await header.user1.graphql<Comment>(ADD_COMMENT, {
      token: <AddCommentInput>{
        post: post._id,
        parent: parent._id,
        content: 'Child 2',
        public: true
      }
    });

    child1 = newComment1;
    child2 = newComment2;
  });

  it('did add 2 children to the parent', async function() {
    const {
      data: { children }
    } = await header.user1.graphql<Comment>(GET_COMMENT, { id: parent._id });

    assert.deepEqual(children.length, 2);
    assert.deepEqual(children[0]._id, child1._id);
    assert.deepEqual(children[1]._id, child2._id);
  });

  it('did set the parent of the 2 children', async function() {
    const { data: comment1 } = await header.user1.graphql<Comment>(
      `{ comment(id: "${child1._id}") { parent { _id } } }`
    );
    const { data: comment2 } = await header.user1.graphql<Comment>(
      `{ comment(id: "${child2._id}") { parent { _id } } }`
    );
    assert.deepEqual(comment1.parent!._id, parent._id);
    assert.deepEqual(comment2.parent!._id, parent._id);
  });

  it('did remove a child from the parent array when child is deleted', async function() {
    const { data: childRemoved } = await header.user1.graphql<boolean>(REMOVE_COMMENT, {
      id: child1._id
    });
    const { data: parentComment } = await header.user1.graphql<Comment>(GET_COMMENT, { id: parent._id });

    assert(childRemoved);
    assert.deepEqual(parentComment.children.length, 1);
    assert.deepEqual(
      parentComment.children.find(c => c._id === child1._id),
      undefined
    );
  });

  it('did remove child comment when parent is deleted', async function() {
    const { data: parentRemoved } = await header.user1.graphql<boolean>(REMOVE_COMMENT, { id: parent._id });
    const { data } = await header.user1.graphql<Comment>(GET_COMMENT, { id: child2._id });

    assert(parentRemoved);
    assert.deepEqual(data, null);
  });
});
