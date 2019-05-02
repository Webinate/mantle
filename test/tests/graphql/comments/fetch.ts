import * as assert from 'assert';
import { IPost, IComment, Page, IAdminUser, IUserEntry, IDocument, IDraft, ITemplate } from '../../../../src';
import header from '../../header';
import ControllerFactory from '../../../../src/core/controller-factory';
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

describe('Testing fetching of comments', function() {
  before(async function() {
    const {
      data: { count: postCount }
    } = await header.admin.graphql<{ count: number }>(`{ posts { count } }`);

    const {
      data: { count: commentCount }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } }`);

    const { data: user } = await header.admin.graphql<Partial<IUserEntry<'expanded'>>>(`{ user( username: "${
      (header.config.adminUser as IAdminUser).username
    }" ) {
      ...UserFields
    } } ${userFragment}`);

    numPosts = postCount;
    numComments = commentCount;
    admin = user;

    // const users = ControllerFactory.get('users');
    // admin = (await users.getUser({ username: (header.config.adminUser as IAdminUser).username })) as IUserEntry<
    //   'expanded'
    // >;
  });

  it('can create a temp post', async function() {
    const {
      data: { public: isPublic, _id }
    } = await header.admin.graphql<Partial<IPost<'expanded'>>>(`mutation { createPost( token: {
      title: "Simple Test",
      slug: "${generateRandString(10)}",
      brief: "This is brief",
      public: false
    } ) { _id, public } }`);

    postId = _id;
    assert(isPublic === false);

    // const resp = await header.admin.post(`/api/posts`, {
    //   title: 'Simple Test',
    //   slug: generateRandString(10),
    //   brief: 'This is brief',
    //   public: false
    // });
    // assert.deepEqual(resp.status, 200);
    // const json = await resp.json();
    // postId = json._id;
    // assert(json.public === false);
  });

  it('did create a test public comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<Partial<IComment<'expanded'>>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Hello world public! __filter__",
      public: true
    } ) { _id } }`);

    assert(_id);
    publicCommentId = _id;

    // const resp = await header.admin.post(`/api/posts/${postId}/comments`, {
    //   content: 'Hello world public! __filter__',
    //   public: true
    // });
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();
    // publicCommentId = json._id;
  });

  it('did create a test private comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<Partial<IComment<'expanded'>>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Hello world private! __filter__",
      public: false
    } ) { _id } }`);

    assert(_id);
    privateCommentId = _id;

    // const resp = await header.admin.post(`/api/posts/${postId}/comments`, {
    //   content: 'Hello world private! __filter__',
    //   public: false
    // });
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();
    // privateCommentId = json._id;
  });

  it('can create a another comment which will be a parent comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<Partial<IComment<'expanded'>>>(`mutation { createComment( token: {
      post: "${postId}",
      content: "Parent Comment",
      public: true
    } ) { _id } }`);

    assert(_id);
    parentCommentId = _id;

    // const resp = await header.admin.post(`/api/posts/${postId}/comments`, { content: 'Parent Comment', public: true });
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();
    // parentCommentId = json._id;
  });

  it('can create a nested comment', async function() {
    const {
      data: { _id }
    } = await header.admin.graphql<Partial<IComment<'expanded'>>>(`mutation { createComment( token: {
      post: "${postId}",
      parent: "${parentCommentId}",
      content: "Child Comment",
      public: true
    } ) { _id } }`);

    childCommentId = _id;

    // const resp = await header.admin.post(`/api/posts/${postId}/comments/${parentCommentId}`, {
    //   content: 'Child Comment',
    //   public: true
    // });
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();
    // childCommentId = json._id;
  });

  it('cannot get a comment with an invalid id', async function() {
    const { errors } = await header.admin.graphql<Partial<IComment<'expanded'>>>(`{ getComment(id: "BADID") { _id } }`);

    assert.deepEqual(errors[0].message, 'Invalid ID format');

    // const resp = await header.admin.get(`/api/comments/BADID`);
    // assert.deepEqual(resp.status, 500);
    // const json = await resp.json();
    // assert.deepEqual(json.message, 'Invalid ID format');
  });

  it('cannot get a comment that does not exist', async function() {
    const { errors } = await header.admin.graphql<Partial<IComment<'expanded'>>>(
      `{ getComment(id: "123456789012345678901234") { _id } }`
    );

    assert.deepEqual(errors[0].message, 'Could not find comment');

    // const resp = await header.admin.get(`/api/comments/123456789012345678901234`);
    // assert.deepEqual(resp.status, 500);
    // const json = await resp.json();
    // assert.deepEqual(json.message, 'Could not find comment');
  });

  it('can get a valid comment by ID', async function() {
    const { data } = await header.admin.graphql<Partial<IComment<'expanded'>>>(
      `{ getComment(id: "${publicCommentId}") { ...CommentFields } } ${commentFragment}`
    );

    assert.deepEqual(data._id, publicCommentId);
    assert.deepEqual(data.author, admin.username);
    assert.deepEqual(data.user, admin._id);
    assert.deepEqual(data.content, 'Hello world public! __filter__');
    assert.deepEqual(data.public, true);

    // const resp = await header.admin.get(`/api/comments/${publicCommentId}`);
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();
    // assert.deepEqual(json._id, publicCommentId);
    // assert.deepEqual(json.author, admin.username);
    // assert.deepEqual(json.user, admin._id);
    // assert.deepEqual(json.content, 'Hello world public! __filter__');
    // assert.deepEqual(json.public, true);
  });

  it('cannot get a private comment without being logged in', async function() {
    const { errors } = await header.guest.graphql<Partial<IComment<'expanded'>>>(
      `{ getComment(id: "${privateCommentId}") { _id } }`
    );

    assert.deepEqual(errors[0].message, 'That comment is marked private');

    // const resp = await header.guest.get(`/api/comments/${privateCommentId}`);
    // assert.deepEqual(resp.status, 500);
    // const json = await resp.json();
    // assert.deepEqual(json.message, 'That comment is marked private');
  });

  it('can get a public comment without being logged in', async function() {
    const { data } = await header.guest.graphql<Partial<IComment<'expanded'>>>(
      `{ getComment(id: "${publicCommentId}") { ...CommentFields } } ${commentFragment}`
    );

    assert.deepEqual(data._id, publicCommentId);
    assert.deepEqual(data.author, admin.username);
    assert.deepEqual(data.user, admin._id);
    assert.deepEqual(data.content, 'Hello world public! __filter__');
    assert.deepEqual(data.public, true);

    // const resp = await header.guest.get(`/api/comments/${publicCommentId}`);
    // assert.deepEqual(resp.status, 200);
    // const json: IComment<'client'> = await resp.json();

    // assert.deepEqual(json._id, publicCommentId);
    // assert.deepEqual(json.author, admin.username);
    // assert.deepEqual(json.user, admin._id);
    // assert.deepEqual(json.content, 'Hello world public! __filter__');
    // assert.deepEqual(json.public, true);
  });

  it('can get comments by user & there are more than 1', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<{ count: number }>(`{ getComments { count } } ${commentFragment}`);

    assert(count >= 2);

    // const resp = await header.admin.get(`/api/users/${header.admin.username}/comments`);
    // assert.deepEqual(resp.status, 200);
    // const json: Page<IComment<'client'>> = await resp.json();
    // assert(json.count >= 2);
  });

  it('can get comments by user & there should be 2 if we filter by keyword', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<{ count: number }>(
      `{ getComments(keyword: "__filter__" ) { count } } ${commentFragment}`
    );

    assert(count === 2);

    // const resp = await header.admin.get(`/api/users/${header.admin.username}/comments?keyword=__filter__`);
    // assert.deepEqual(resp.status, 200);
    // const json: Page<IComment<'client'>> = await resp.json();
    // assert(json.data.length === 2);
  });

  it('can get comments by user & should limit whats returned to 1', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(
      `{ getComments(keyword: "__filter__", limit: 1 ) { data { _id } } } ${commentFragment}`
    );

    assert(data.length === 1);

    // const resp = await header.admin.get(`/api/users/${header.admin.username}/comments?keyword=__filter__&limit=1`);
    // assert.deepEqual(resp.status, 200);
    // const json: Page<IComment<'client'>> = await resp.json();
    // assert(json.data.length === 1);
  });

  it('can get comments by user & should limit whats returned to 1 if not admin', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IComment<'expanded'>>>(
      `{ getComments(keyword: "__filter__", user: "${header.admin.username}" ) { data { _id } } } ${commentFragment}`
    );

    assert(data.length === 1);

    // const resp = await header.guest.get(`/api/users/${header.admin.username}/comments?keyword=__filter__`);
    // assert.deepEqual(resp.status, 200);
    // const json: Page<IComment<'client'>> = await resp.json();
    // assert(json.data.length === 1);
  });

  // it('can get the parent comment and has previously created comment as child', async function() {
  //   const resp = await header.admin.get(`/api/comments/${parentCommentId}`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   assert.deepEqual(json._id, parentCommentId);
  //   assert((json.children as string[]).indexOf(childCommentId) !== -1);
  // });

  // it('can get a comment with parent & post, and both properties are just ids (not expanded)', async function() {
  //   const resp = await header.admin.get(`/api/comments/${childCommentId}`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   assert.deepEqual(json._id, childCommentId);
  //   assert.deepEqual(json.parent, parentCommentId);
  //   assert.deepEqual(json.post, postId);
  // });

  // it('can get a comment with parent & post, and both properties are the respective objects (expanded)', async function() {
  //   const resp = await header.admin.get(`/api/comments/${childCommentId}?expanded=true`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   assert.deepEqual(json._id, childCommentId);
  //   assert.deepEqual(json.parent, parentCommentId);
  //   assert.deepEqual((json.post as IPost<'client'>)._id, postId);
  //   assert.deepEqual((json.user as IUserEntry<'client'>)._id, admin._id);
  // });

  // it('can get a comment with post, draft & html if depth is -1', async function() {
  //   const resp = await header.admin.get(`/api/comments/${publicCommentId}?expanded=true&depth=-1`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'expanded'> = await resp.json();
  //   assert.deepEqual(json.post._id, postId);
  //   assert.deepEqual(json.post.document.html[json.post.document.template.defaultZone], '<p></p>');
  // });

  // it('should prevent guests from getting sensitive data (expanded)', async function() {
  //   const resp = await header.guest.get(`/api/comments/${childCommentId}?expanded=true`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   assert.deepEqual((json.user as IUserEntry<'client'>).email, undefined);
  // });

  // it('did delete the test post', async function() {
  //   const resp = await header.admin.delete(`/api/posts/${postId}`);
  //   assert.deepEqual(resp.status, 204);
  // });

  // it('has cleaned up the posts successfully', async function() {
  //   const resp = await header.admin.get(`/api/posts`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: Page<IPost<'client'>> = await resp.json();
  //   assert(json.count === numPosts);
  // });

  // it('should have the same number of comments as before the tests started', async function() {
  //   const resp = await header.admin.get(`/api/comments`);
  //   assert.deepEqual(resp.status, 200);
  //   const json: Page<IComment<'client'>> = await resp.json();
  //   assert(numComments === json.count);
  // });
});
