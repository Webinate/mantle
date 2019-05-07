import * as assert from 'assert';
import { IPost, IComment } from '../../../../src';
import header from '../../header';
import { commentFragment } from '../fragments';

let numPosts: number, numComments: number, postId: string, commentId: string;

describe('[GQL] Testing creation of comments', function() {
  before(async function() {
    const {
      data: { count: postCount }
    } = await header.admin.graphql<{ count: number }>(`{ getPosts { count } }`);

    const {
      data: { count: commentCount }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);

    numPosts = postCount;
    numComments = commentCount;
  });

  after(async function() {
    const {
      data: { count: postCount }
    } = await header.admin.graphql<{ count: number }>(`{ getPosts { count } }`);

    const {
      data: { count: commentCount }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);

    assert.equal(numPosts, postCount);
    assert.equal(numComments, commentCount);
  });

  it('can create a temp post', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<{ _id: string }>(`mutation { createPost( token: {
      title: "Simple Test",
      slug: "${header.makeid()}",
      brief: "This is brief",
      public: false
     } ) { _id } }`);

    postId = _id;
  });

  it('cannot create a comment when not logged in', async function() {
    const resp = await header.guest.graphql<{ _id: string }>(`mutation { createComment( token: {
      post: "123456789012345678901234"
     } ) { _id } }`);

    assert.deepEqual(resp.errors[0].message, 'Authentication Error');
  });

  it('cannot create a comment with a badly formatted post id', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(`mutation { createComment( token: {
      post: "bad"
      parent: "bad"
     } ) { _id } }`);

    assert.deepEqual(
      resp.errors[0].message,
      'Expected type ObjectId!, found "bad"; ObjectId must be a single String of 24 hex characters'
    );
    assert.deepEqual(
      resp.errors[1].message,
      'Expected type ObjectId, found "bad"; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('cannot create a comment without a post that actually exists', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(`mutation { createComment( token: {
      post: "123456789012345678901234"
      content: "Test"
     } ) { _id } }`);

    assert.deepEqual(resp.errors[0].message, 'post does not exist');
  });

  it('cannot create a comment without a comment that actually exists', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(`mutation { createComment( token: {
      post: "123456789012345678901234"
      parent: "123456789012345678901234"
      content: "Test"
     } ) { _id } }`);

    assert.deepEqual(resp.errors[0].message, 'No comment exists with the id 123456789012345678901234');
  });

  it('cannot create a comment with illegal html', async function() {
    const resp = await header.admin.graphql<{ _id: string }>(`mutation { createComment( token: {
      post: "${postId}"
      content: "Hello world! __filter__ <script type=\'text/javascript\'>alert\('BOOO')</script>"
     } ) { _id } }`);

    assert.deepEqual(resp.errors[0].message, `'content' has html code that is not allowed`);
  });

  it('can create a comment on a valid post', async function() {
    const { data: newComment } = await header.admin.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${postId}"
      content: "Hello world! __filter__"
      public: false
     } ) {
       ...CommentFields,
       children { _id },
       post { _id }
      } } ${commentFragment}`);

    commentId = newComment._id;
    assert(newComment._id);
    assert(newComment.author);
    assert.deepEqual(newComment.post._id, postId);
    assert.deepEqual(newComment.content, 'Hello world! __filter__');
    assert(newComment.children.length === 0);
    assert(newComment.public === false);
    assert(newComment.createdOn);
    assert(newComment.lastUpdated);
  });

  it('can create a another comment on the same post, with a parent comment', async function() {
    const { data: _id } = await header.admin.graphql<{ _id: string }>(`mutation { createComment( token: {
       post: "${postId}"
       parent: "${commentId}"
       content: "Hello world! __filter__"
       public: false
      } ) {
        _id
       } }`);

    assert(_id);
  });

  it('did delete the test post', async function() {
    const { data: postRemoved } = await header.admin.graphql<boolean>(`mutation { removePost( id: "${postId}")  }`);
    assert.deepEqual(postRemoved, true);
  });
});
