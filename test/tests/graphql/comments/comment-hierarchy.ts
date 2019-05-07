import * as assert from 'assert';
import { IPost, IComment } from '../../../../src';
import header from '../../header';
import { randomString } from '../../utils';
import { postFragment, commentFragment } from '../fragments';

let post: IPost<'expanded'>, parent: IComment<'expanded'>, child1: IComment<'expanded'>, child2: IComment<'expanded'>;

describe('[GQL] Testing the parent child relationship of comments: ', function() {
  before(async function() {
    const { data: newPost } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createPost( token: {
      slug: "${randomString()}",
      title: "Temp Post",
      public: true
    } ) { ...PostFields } } ${postFragment}`);
    post = newPost;
    assert(newPost);
  });

  after(async function() {
    const { data: postRemoved } = await header.admin.graphql<boolean>(`mutation { removePost( id:"${post._id}") }`);
    assert(postRemoved);
  });

  it('did create a parent comment', async function() {
    const { data: newComment } = await header.user1.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${post._id}",
      content: "Parent",
      public: true
    } ) { ...CommentFields } } ${commentFragment}`);
    parent = newComment;
  });

  it('did create 2 children comments', async function() {
    const { data: newComment1 } = await header.user1.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${post._id}",
      parent: "${parent._id}",
      content: "Child 1",
      public: true
    } ) { ...CommentFields } } ${commentFragment}`);

    const { data: newComment2 } = await header.user1.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${post._id}",
      parent: "${parent._id}",
      content: "Child 2",
      public: true
    } ) { ...CommentFields } } ${commentFragment}`);

    child1 = newComment1;
    child2 = newComment2;
  });

  it('did add 2 children to the parent', async function() {
    const {
      data: { children }
    } = await header.user1.graphql<IComment<'expanded'>>(`{ getComment(id: "${parent._id}") { children { _id } } }`);

    assert.deepEqual(children.length, 2);
    assert.deepEqual(children[0]._id, child1._id);
    assert.deepEqual(children[1]._id, child2._id);
  });

  it('did set the parent of the 2 children', async function() {
    const { data: comment1 } = await header.user1.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${child1._id}") { parent { _id } } }`
    );
    const { data: comment2 } = await header.user1.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${child2._id}") { parent { _id } } }`
    );
    assert.deepEqual(comment1.parent._id, parent._id);
    assert.deepEqual(comment2.parent._id, parent._id);
  });

  it('did remove a child from the parent array when child is deleted', async function() {
    const { data: childRemoved } = await header.user1.graphql<boolean>(
      `mutation { removeComment(id: "${child1._id}") }`
    );
    const { data: parentComment } = await header.user1.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${parent._id}") { children { _id } } }`
    );

    assert(childRemoved);
    assert.deepEqual(parentComment.children.length, 1);
    assert.deepEqual(parentComment.children.find(c => c._id === child1._id), undefined);
  });

  it('did remove child comment when parent is deleted', async function() {
    const { data: parentRemoved } = await header.user1.graphql<boolean>(
      `mutation { removeComment(id: "${parent._id}") }`
    );
    const { data } = await header.user1.graphql<IComment<'expanded'>>(`{ getComment(id: "${child2._id}") { _id } }`);

    assert(parentRemoved);
    assert.deepEqual(data, null);
  });
});
