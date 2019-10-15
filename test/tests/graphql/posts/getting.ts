import * as assert from 'assert';
import { IPost, Page, IFileEntry, IUserEntry, IVolume } from '../../../../src';
import header from '../../header';
import ControllerFactory from '../../../../src/core/controller-factory';
import { uploadFileToVolume } from '../../file';
import { generateRandString } from '../../../../src/utils/utils';
import { CREATE_POST, GET_POSTS, GET_POST, DELETE_POST } from '../queries/posts';

const randomSlug = generateRandString(10);
const privateSlug = generateRandString(10);
const randomCategory = generateRandString(10);
const randomTag = generateRandString(10);
const randomTag2 = generateRandString(10);
let volume: IVolume<'expanded'>;
let numPosts: number, publicPostId: string, privatePostId: string, file: IFileEntry<'expanded'>;

describe('Testing fetching of posts', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    const user = await users.getUser({ username: header.admin.username });

    const volumes = ControllerFactory.get('volumes');
    volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'expanded'>;
    file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'expanded'>;
  });

  after(async function() {
    const volumes = ControllerFactory.get('volumes');
    await volumes.remove({ _id: volume._id });
  });

  it('fetched all posts', async function() {
    const { data } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS);
    numPosts = data.count;
  });

  it('did create a public post to test fetching public post data', async function() {
    const newPost: Partial<IPost<'client'>> = {
      title: 'Simple Test',
      slug: randomSlug,
      public: true,
      featuredImage: file._id.toString(),
      categories: [randomCategory],
      tags: [randomTag, randomTag2]
    };

    const { data: post } = await header.admin.graphql<IPost<'expanded'>>(CREATE_POST, { token: newPost });
    assert(post._id);
    publicPostId = post._id;
  });

  it('did create a private post to test fetching private post data', async function() {
    const { data: post } = await header.admin.graphql<IPost<'expanded'>>(CREATE_POST, {
      token: { title: 'Simple Test', slug: privateSlug, public: false }
    });
    assert(post._id);
    privatePostId = post._id;
  });

  it('cannot get a post that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { slug: '--simple--test--2--' });
    assert(errors[0].message, 'Could not find post');
  });

  it('can fetch multiple posts, and those posts have correct data', async function() {
    const { data: page } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      visibility: 'PUBLIC',
      sortOrder: 'desc',
      sort: 'created'
    });

    const post = page.data[0];
    assert.deepEqual(post.author.username, header.admin.username);
    assert.deepEqual(post.title, 'Simple Test');
    assert.deepEqual(post.slug, randomSlug);
    assert.deepEqual(post.public, true);
    assert.deepEqual(post.categories.length, 1);
    assert.deepEqual(post.tags.length, 2);
    assert.deepEqual(post.featuredImage._id, file._id.toString());
    assert.deepEqual(typeof post.document._id, 'string');
  });

  it('can fetch posts and impose a limit off 1 on them', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      limit: 1
    });
    assert(data.length === 1);
  });

  it('can fetch posts and impose an index and limit', async function() {
    const {
      data: { data }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      index: numPosts ? numPosts - 1 : 0,
      limit: 1
    });
    assert(data.length === 1);
  });

  it('fetched 1 post with category specified', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      categories: [randomCategory]
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 1 post with tag specified', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: randomTag
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 1 post with 2 tags specified', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag, randomTag2]
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 1 post with 2 known tags specified & 1 unknown', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag, randomTag2, 'dinos']
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 1 post with 1 known tag & 1 category', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag],
      categories: [randomCategory]
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 0 posts with 1 known tag & 1 unknown category', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag],
      categories: ['super-tests-wrong']
    });
    assert.deepEqual(count, 0);
  });

  it('fetched 1 posts when not logged in as admin and post is not public', async function() {
    const {
      data: { count }
    } = await header.guest.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag],
      categories: [randomCategory]
    });
    assert.deepEqual(count, 1);
  });

  it('Should not fetch with a tag that is not associated with any posts', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: ['nononononononoonononono']
    });
    assert.deepEqual(count, 0);
  });

  it('cannot fetch single post by invalid slug', async function() {
    const { errors } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { slug: 'WRONGWRONGWRONG' });
    assert.deepEqual(errors[0].message, 'Could not find post');
  });

  it('can fetch single post by slug', async function() {
    const { data: post } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { slug: randomSlug });
    assert.deepEqual(post.author.username, header.admin.username);
    assert.deepEqual(post.title, 'Simple Test');
    assert.deepEqual(post.slug, randomSlug);
    assert.deepEqual(post.public, true);
    assert.deepEqual(post.categories.length, 1);
    assert.deepEqual(post.tags.length, 2);
    assert.deepEqual(post.featuredImage._id, file._id.toString());
    assert.deepEqual(post.latestDraft, null);

    // Check that we get the doc
    const doc = post.document;
    assert.notDeepEqual(doc.template, null);
    assert.deepEqual(doc.template.name, 'Simple Post');
    assert.deepEqual(doc.author.username, header.admin.username);
    assert(doc.createdOn > 0);
    assert(doc.lastUpdated > 0);

    // Check the elements
    assert.deepEqual(doc.elements.length, 1);
    assert.deepEqual(doc.elements[0].html, '<p></p>');
    assert.deepEqual(doc.elements[0].zone, 'main');
    assert.deepEqual(doc.elements[0].parent._id, doc._id);
    assert.deepEqual(doc.elements[0].type, 'elm-paragraph');
    assert(Array.isArray(doc.elementsOrder));
    assert.deepEqual(doc.elementsOrder[0], doc.elements[0]._id);
  });

  it('cannot fetch a private post by slug when not logged in', async function() {
    const { errors } = await header.guest.graphql<IPost<'expanded'>>(GET_POST, { slug: privateSlug });
    assert.deepEqual(errors[0].message, 'That post is marked private');
  });

  it('can fetch a public post by slug when not logged in', async function() {
    const { data } = await header.guest.graphql<IPost<'expanded'>>(GET_POST, { slug: randomSlug });
    assert(data._id);
  });

  it('did cleanup the test public post', async function() {
    const resp = await header.admin.graphql<boolean>(DELETE_POST, { id: publicPostId });
    assert.deepEqual(resp.data, true);
  });

  it('did cleanup the test private post', async function() {
    const resp = await header.admin.graphql<boolean>(DELETE_POST, { id: privatePostId });
    assert.deepEqual(resp.data, true);
  });

  it('has cleaned up the posts successfully', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS);
    assert(count === numPosts);
  });
});
