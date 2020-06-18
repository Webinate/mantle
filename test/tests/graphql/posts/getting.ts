import * as assert from 'assert';
import { IPost, Page, IFileEntry, IUserEntry, IVolume, ICategory } from '../../../../src';
import header from '../../header';
import ControllerFactory from '../../../../src/core/controller-factory';
import { uploadFileToVolume } from '../../file';
import { generateRandString } from '../../../../src/utils/utils';
import { GET_POSTS, ADD_POST, GET_POST, REMOVE_POST } from '../../../../src/graphql/client/requests/posts';
import { AddPostInput } from '../../../../src/graphql/models/post-type';
import { PostSortType, SortOrder, PostVisibility } from '../../../../src/core/enums';
import { ADD_CATEGORY, REMOVE_CATEGORY } from '../../../../src/graphql/client/requests/category';
import { AddCategoryInput } from '../../../../src/graphql/models/category-type';

const randomSlug = generateRandString(10);
const privateSlug = generateRandString(10);
const randomTag = generateRandString(10);
const randomTag2 = generateRandString(10);
let volume: IVolume<'server'>;
let category: ICategory<'expanded'>;
let numPosts: number, publicPostId: string, privatePostId: string, file: IFileEntry<'server'>;

describe('Testing fetching of posts', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    const user = (await users.getUser({ username: header.admin.username })) as IUserEntry<'server'>;

    const catResp = await header.admin.graphql<ICategory<'expanded'>>(ADD_CATEGORY, {
      token: new AddCategoryInput({
        title: generateRandString(10),
        slug: generateRandString(10)
      })
    });
    category = catResp.data;
    assert(category);

    const volumes = ControllerFactory.get('volumes');
    volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'server'>;
    file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'server'>;
  });

  after(async function() {
    const volumes = ControllerFactory.get('volumes');
    await volumes.remove({ _id: volume._id });

    const catResp = await header.admin.graphql<boolean>(REMOVE_CATEGORY, { id: category._id });
    assert(catResp.data);
  });

  it('fetched all posts', async function() {
    const resp = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS);
    numPosts = resp.data.count;
  });

  it('did create a public post to test fetching public post data', async function() {
    const resp = await header.admin.graphql<IPost<'expanded'>>(ADD_POST, {
      token: new AddPostInput({
        title: 'Simple Test',
        slug: randomSlug,
        public: true,
        featuredImage: file._id.toString(),
        categories: [category._id],
        tags: [randomTag, randomTag2]
      })
    });
    assert(resp.data._id);
    publicPostId = resp.data._id;
  });

  it('did create a private post to test fetching private post data', async function() {
    const { data: post } = await header.admin.graphql<IPost<'expanded'>>(ADD_POST, {
      token: new AddPostInput({
        title: 'Simple Test',
        slug: privateSlug,
        public: false
      })
    });
    assert(post._id);
    privatePostId = post._id;
  });

  it('cannot get a post that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { slug: '--simple--test--2--' });
    assert(errors![0].message, 'Could not find post');
  });

  it('can fetch multiple posts, and those posts have correct data', async function() {
    const { data: page } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      visibility: PostVisibility.public,
      sortOrder: SortOrder.desc,
      sortType: PostSortType.created
    });

    const post = page.data[0];
    assert.deepEqual(post.author!.username, header.admin.username);
    assert.deepEqual(post.title, 'Simple Test');
    assert.deepEqual(post.slug, randomSlug);
    assert.deepEqual(post.public, true);
    assert.deepEqual(post.categories.length, 1);
    assert.deepEqual(post.tags.length, 2);
    assert.deepEqual(post.featuredImage!._id, file._id.toString());
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
      categories: [category._id]
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
      categories: [category._id]
    });
    assert.deepEqual(count, 1);
  });

  it('fetched 0 posts with 1 known tag & 1 unknown category', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag],
      categories: ['123456789012345678901234']
    });
    assert.deepEqual(count, 0);
  });

  it('fetched 1 posts when not logged in as admin and post is not public', async function() {
    const resp = await header.guest.graphql<Page<IPost<'expanded'>>>(GET_POSTS, {
      tags: [randomTag],
      categories: [category._id]
    });
    assert.deepEqual(resp.data.count, 1);
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
    assert.deepEqual(errors![0].message, 'Could not find post');
  });

  it('can fetch single post by slug', async function() {
    const { data: post } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { slug: randomSlug });
    assert.deepEqual(post.author!.username, header.admin.username);
    assert.deepEqual(post.title, 'Simple Test');
    assert.deepEqual(post.slug, randomSlug);
    assert.deepEqual(post.public, true);
    assert.deepEqual(post.categories.length, 1);
    assert.deepEqual(post.tags.length, 2);
    assert.deepEqual(post.featuredImage!._id, file._id.toString());
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
    assert.deepEqual(doc.elements[0].parent, doc._id);
    assert.deepEqual(doc.elements[0].type, 'paragraph');
    assert(Array.isArray(doc.elementsOrder));
    assert.deepEqual(doc.elementsOrder[0], doc.elements[0]._id);
  });

  it('cannot fetch a private post by slug when not logged in', async function() {
    const { errors } = await header.guest.graphql<IPost<'expanded'>>(GET_POST, { slug: privateSlug });
    assert.deepEqual(errors![0].message, 'That post is marked private');
  });

  it('can fetch a public post by slug when not logged in', async function() {
    const { data } = await header.guest.graphql<IPost<'expanded'>>(GET_POST, { slug: randomSlug });
    assert(data._id);
  });

  it('did cleanup the test public post', async function() {
    const resp = await header.admin.graphql<boolean>(REMOVE_POST, { id: publicPostId });
    assert.deepEqual(resp.data, true);
  });

  it('did cleanup the test private post', async function() {
    const resp = await header.admin.graphql<boolean>(REMOVE_POST, { id: privatePostId });
    assert.deepEqual(resp.data, true);
  });

  it('has cleaned up the posts successfully', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<Page<IPost<'expanded'>>>(GET_POSTS);
    assert(count === numPosts);
  });
});
