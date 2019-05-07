import * as assert from 'assert';
import { IPost, IComment, Page, IAdminUser, IUserEntry } from '../../../../src';
import header from '../../header';
import { generateRandString } from '../../../../src/utils/utils';
import { userFragment, commentFragment } from '../fragments';

let numPosts: number,
  numComments: number,
  postId: string,
  publicCommentId: string,
  privateCommentId: string,
  parentCommentId: string,
  childCommentId: string,
  admin: Partial<IUserEntry<'expanded'>>;

describe('[GQL] Testing fetching of comments', function() {
  before(async function() {
    const {
      data: { count: postCount }
    } = await header.admin.graphql<{ count: number }>(`{ getPosts { count } }`);

    const {
      data: { count: commentCount }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);

    const { data: user } = await header.admin.graphql<IUserEntry<'expanded'>>(`{ getUser( username: "${
      (header.config.adminUser as IAdminUser).username
    }" ) {
      ...UserFields
    } } ${userFragment}`);

    numPosts = postCount;
    numComments = commentCount;
    admin = user;
  });

  it('can create a temp post', async function() {
    const {
      data: { public: isPublic, _id }
    } = await header.admin.graphql<IPost<'expanded'>>(`mutation { createPost( token: {
      title: "Simple Test",
      slug: "${generateRandString(10)}",
      brief: "This is brief",
      public: false
    } ) { _id, public } }`);

    postId = _id;
    assert(isPublic === false);
  });

  it('did create a test public comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Hello world public! __filter__",
      public: true
    } ) { _id } }`);

    assert(_id);
    publicCommentId = _id;
  });

  it('did create a test private comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Hello world private! __filter__",
      public: false
    } ) { _id } }`);

    assert(_id);
    privateCommentId = _id;
  });

  it('can create a another comment which will be a parent comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Parent Comment",
      public: true
    } ) { _id } }`);

    assert(_id);
    parentCommentId = _id;
  });

  it('can create a nested comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<IComment<'expanded'>>(`mutation { createComment( token: {
      post: "${postId}",
      parent: "${parentCommentId}",
      content: "Child Comment",
      public: true
    } ) { _id } }`);

    childCommentId = _id;
  });

  it('cannot get a comment with an invalid id', async function() {
    const { errors } = await header.admin.graphql<IComment<'expanded'>>(`{ getComment(id: "BADID") { _id } }`);

    assert.deepEqual(
      errors[0].message,
      'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('cannot get a comment that does not exist', async function() {
    const { errors } = await header.admin.graphql<IComment<'expanded'>>(
      `{ getComment(id: "123456789012345678901234") { _id } }`
    );
    assert.deepEqual(errors[0].message, 'Could not find comment');
  });

  it('can get a valid comment by ID', async function() {
    const { data } = await header.admin.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${publicCommentId}") { ...CommentFields, user { _id } } } ${commentFragment}`
    );

    assert.deepEqual(data._id, publicCommentId);
    assert.deepEqual(data.author, admin.username);
    assert.deepEqual(data.user._id, admin._id);
    assert.deepEqual(data.content, 'Hello world public! __filter__');
    assert.deepEqual(data.public, true);
  });

  it('cannot get a private comment without being logged in', async function() {
    const { errors } = await header.guest.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${privateCommentId}") { _id } }`
    );

    assert.deepEqual(errors[0].message, 'That comment is marked private');
  });

  it('can get a public comment without being logged in', async function() {
    const { data } = await header.guest.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${publicCommentId}") { ...CommentFields, user { _id } } } ${commentFragment}`
    );

    assert.deepEqual(data._id, publicCommentId);
    assert.deepEqual(data.author, admin.username);
    assert.deepEqual(data.user._id, admin._id);
    assert.deepEqual(data.content, 'Hello world public! __filter__');
    assert.deepEqual(data.public, true);
  });

  it('can get comments by user & there are more than 1', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(`{ getComments { count } }`);

    assert(count >= 2);
  });

  it('can get comments by user & there should be 2 if we filter by keyword', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(
      `{ getComments(keyword: "__filter__" ) { data { _id } } }`
    );

    assert(data.length === 2);
  });

  it('can get comments by user & should limit whats returned to 1', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(
      `{ getComments(keyword: "__filter__", limit: 1 ) { data { _id } } }`
    );

    assert(data.length === 1);
  });

  it('can get comments by user & should limit whats returned to 1 if not admin', async function() {
    const {
      data: { data }
    } = await header.guest.graphql<Page<IComment<'expanded'>>>(
      `{ getComments(keyword: "__filter__", user: "${header.admin.username}" ) { data { _id } } }`
    );

    assert.deepEqual(data.length, 1);
  });

  it('can get the parent comment and has previously created comment as child', async function() {
    const {
      data: { _id, children }
    } = await header.admin.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${parentCommentId}") { _id, children { _id } } }`
    );
    assert.deepEqual(_id, parentCommentId);
    assert(children.find(c => c._id === childCommentId));
  });

  it('can get a comment with parent & post', async function() {
    const {
      data: { _id, parent, post }
    } = await header.admin.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${childCommentId}") { _id, parent { _id }, post { _id } } }`
    );
    assert.deepEqual(_id, childCommentId);
    assert.deepEqual(parent._id, parentCommentId);
    assert.deepEqual(post._id, postId);
  });

  it('can get a comment with post, draft & html', async function() {
    const {
      data: { _id, post }
    } = await header.admin.graphql<IComment<'expanded'>>(
      `{ getComment(id: "${publicCommentId}") { _id, post { _id, document { html, template { defaultZone } } } } }`
    );
    assert.deepEqual(_id, publicCommentId);
    assert.deepEqual(post._id, postId);
    assert.deepEqual(post.document.html[post.document.template.defaultZone], '<p></p>');
  });

  it('should prevent guests from getting sensitive data', async function() {
    const {
      data: { user }
    } = await header.guest.graphql<IComment<'expanded'>>(`{ getComment(id: "${childCommentId}") { user { email } } }`);

    assert.deepEqual(user.email, undefined);
  });

  it('did delete the test post', async function() {
    const { data: isDeleted } = await header.admin.graphql<boolean>(`mutation { removePost(id: "${postId}") }`);
    assert(isDeleted);
  });

  it('should have the same number of posts and comments as before', async function() {
    const {
      data: { count: postCount }
    } = await header.admin.graphql<{ count: number }>(`{ getPosts { count } }`);

    const {
      data: { count: commentCount }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);

    assert(numPosts === postCount);
    assert(numComments === commentCount);
  });
});
