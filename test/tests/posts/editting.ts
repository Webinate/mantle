import * as assert from 'assert';
import { IPost, Page } from '../../../src';
import header from '../header';
import { generateRandString } from '../../../src/utils/utils';
let numPosts: number, secondPostId: string;
let post: IPost<'expanded'>;

const randomSlug = generateRandString(10);

describe('Testing editing of posts', function() {
  it('fetched all posts', async function() {
    const resp = await header.admin.get(`/api/posts`);
    assert.deepEqual(resp.status, 200);
    const json: Page<IPost<'expanded'>> = await resp.json();
    numPosts = json.count;
  });

  it('did create a post to test editting post data', async function() {
    const resp = await header.admin.post(`/api/posts`, {
      title: 'Simple Test',
      slug: randomSlug,
      public: true
    });
    assert.deepEqual(resp.status, 200);
    post = await resp.json<IPost<'expanded'>>();
  });

  it('did create a second post to test editting post data', async function() {
    const resp = await header.admin.post(`/api/posts`, {
      title: 'Simple Test',
      slug: generateRandString(10),
      public: true
    });
    assert.deepEqual(resp.status, 200);
    const json: IPost<'client'> = await resp.json();
    secondPostId = json._id;
  });

  it('cannot edit a post with an invalid ID', async function() {
    const resp = await header.admin.put(`/api/posts/woohoo`, { title: 'Simple Test 3' });
    assert.deepEqual(resp.status, 500);
    const json = await resp.json();
    assert.deepEqual(json.message, 'Invalid ID format');
  });

  it('cannot edit a post with an valid ID but doesnt exist', async function() {
    const resp = await header.admin.put(`/api/posts/123456789012345678901234`, { title: 'Simple Test 3' });
    assert.deepEqual(resp.status, 500);
    const json = await resp.json();
    assert.deepEqual(json.message, 'Resource does not exist');
  });

  it('cannot edit a post without permission', async function() {
    const resp = await header.guest.put(`/api/posts/${post._id}`, { title: 'Simple Test 3' });
    assert.deepEqual(resp.status, 401);
    const json = await resp.json();
    assert.deepEqual(json.message, 'You must be logged in to make this request');
  });

  it('cannot change an existing post with a slug already in use', async function() {
    const resp = await header.admin.put(`/api/posts/${secondPostId}`, { slug: randomSlug });
    assert.deepEqual(resp.status, 500);
    const json = await resp.json();
    assert.deepEqual(json.message, "'slug' must be unique");
  });

  it('can change a post slug with a slug already in use, if its the same post', async function() {
    const resp = await header.admin.put(`/api/posts/${post._id}`, { id: post._id, slug: randomSlug });
    assert.deepEqual(resp.status, 200);
    const json: IPost<'client'> = await resp.json();
    assert.deepEqual(json._id, post._id);
    assert.deepEqual(json.slug, randomSlug);
    assert.deepEqual(json.title, 'Simple Test');
  });

  it('can edit a post with valid details', async function() {
    const resp = await header.admin.put(`/api/posts/${post._id}`, { brief: 'Updated' } as Partial<IPost<'client'>>);
    assert.deepEqual(resp.status, 200);
    const json: IPost<'expanded'> = await resp.json();
    assert.deepEqual(json._id, post._id);
    assert.deepEqual(json.brief, 'Updated');

    // Ensure the doc and draft are returned
    assert(typeof json.document._id === 'string');
    assert(json.document.elements.length > 0);
    assert.deepEqual(typeof json.latestDraft._id, 'string');
    assert.deepEqual(json.latestDraft.html.main, '<p></p>');
  });

  it('did update the posts modified property', async function() {
    const resp = await header.admin.get(`/api/posts/${post._id}`);
    assert.deepEqual(resp.status, 200);
    const json = await resp.json<IPost<'client'>>();

    // Creation date should be the same
    assert.deepEqual(json.createdOn, post.createdOn);

    // Modified date should be greater than creation
    assert(json.lastUpdated > json.createdOn);
  });

  it('did cleanup the test post', async function() {
    const resp = await header.admin.delete(`/api/posts/${post._id}`);
    assert.deepEqual(resp.status, 204);
  });

  it('did cleanup the second test post', async function() {
    const resp = await header.admin.delete(`/api/posts/${secondPostId}`);
    assert.deepEqual(resp.status, 204);
  });

  it('has cleaned up the posts successfully', async function() {
    const resp = await header.admin.get(`/api/posts`);
    assert.deepEqual(resp.status, 200);
    const json: Page<IPost<'client'>> = await resp.json();
    assert(json.count === numPosts);
  });
});
