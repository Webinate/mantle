import * as assert from 'assert';
import { IPost, IComment } from '../../../../src';
import header from '../../header';

let numPosts: number, numComments: number, postId: string, commentId: string;

describe('Testing creation of comments', function() {
  // before(async function() {
  //   let resp = await header.admin.get(`/api/posts`);
  //   assert.deepEqual(resp.status, 200);
  //   let postsArr = await resp.json();
  //   numPosts = postsArr.count;
  //   resp = await header.admin.get(`/api/comments`);
  //   assert.deepEqual(resp.status, 200);
  //   let commentsArr = await resp.json();
  //   numComments = commentsArr.count;
  // });
  // after(async function() {
  //   let resp = await header.admin.get(`/api/posts`);
  //   assert.deepEqual(resp.status, 200);
  //   const postsArr = await resp.json();
  //   assert.equal(numPosts, postsArr.count);
  //   resp = await header.admin.get(`/api/comments`);
  //   assert.deepEqual(resp.status, 200);
  //   const commentsArr = await resp.json();
  //   assert.equal(numComments, commentsArr.count);
  // });
  // it('can create a temp post', async function() {
  //   const resp = await header.admin.post(`/api/posts`, {
  //     title: 'Simple Test',
  //     slug: header.makeid(),
  //     brief: 'This is brief',
  //     public: false
  //   });
  //   assert.deepEqual(resp.status, 200);
  //   const json: IPost<'client'> = await resp.json();
  //   postId = json._id;
  // });
  // it('cannot create a comment when not logged in', async function() {
  //   const resp = await header.guest.post(`/api/posts/123456789012345678901234/comments/123456789012345678901234`);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, 'You must be logged in to make this request');
  //   assert.deepEqual(resp.status, 401);
  // });
  // it('cannot create a comment with a badly formatted post id', async function() {
  //   const resp = await header.admin.post(`/api/posts/bad/comments/bad`);
  //   assert.deepEqual(resp.status, 500);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, 'Invalid parent ID format');
  // });
  // it('cannot create a comment with a badly formatted parent comment id', async function() {
  //   const resp = await header.admin.post(`/api/posts/123456789012345678901234/comments/bad`);
  //   assert.deepEqual(resp.status, 500);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, 'Invalid parent ID format');
  // });
  // it('cannot create a comment without a post that actually exists', async function() {
  //   const resp = await header.admin.post(`/api/posts/123456789012345678901234/comments`, { content: 'Test' });
  //   assert.deepEqual(resp.status, 500);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, 'post does not exist');
  // });
  // it('cannot create a comment without a comment that actually exists', async function() {
  //   const resp = await header.admin.post(`/api/posts/123456789012345678901234/comments/123456789012345678901234`);
  //   assert.deepEqual(resp.status, 500);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, 'No comment exists with the id 123456789012345678901234');
  // });
  // it('cannot create a comment with illegal html', async function() {
  //   const resp = await header.admin.post(`/api/posts/${postId}/comments`, {
  //     content: 'Hello world! __filter__ <script type=\'text/javascript\'>alert("BOOO")</script>'
  //   });
  //   assert.deepEqual(resp.status, 500);
  //   const json = await resp.json();
  //   assert.deepEqual(json.message, "'content' has html code that is not allowed");
  // });
  // it('can create a comment on a valid post', async function() {
  //   const resp = await header.admin.post(`/api/posts/${postId}/comments`, {
  //     content: 'Hello world! __filter__',
  //     public: false
  //   });
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   commentId = json._id;
  //   assert(json._id);
  //   assert(json.author);
  //   assert(!json.parent);
  //   assert.deepEqual(json.post, postId);
  //   assert.deepEqual(json.content, 'Hello world! __filter__');
  //   assert(json.children.length === 0);
  //   assert(json.public === false);
  //   assert(json.createdOn);
  //   assert(json.lastUpdated);
  // });
  // it('can create a another comment on the same post, with a parent comment', async function() {
  //   const resp = await header.admin.post(`/api/posts/${postId}/comments/${commentId}`, {
  //     content: 'Hello world 2',
  //     public: true
  //   });
  //   assert.deepEqual(resp.status, 200);
  //   const json: IComment<'client'> = await resp.json();
  //   assert(json.hasOwnProperty('_id'));
  // });
  // it('did delete the test post', async function() {
  //   const resp = await header.admin.delete(`/api/posts/${postId}`);
  //   assert.deepEqual(resp.status, 204);
  // });
});
