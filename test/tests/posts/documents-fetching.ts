import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { GET_DOCUMENT } from '../../client/requests/documents';
import { Document } from '../../../src/index';
import { IPost, IUserEntry } from '../../../src/types';

let post: IPost<'server'>, user1: IUserEntry<'server'>;

describe('Testing the fetching of documents: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'server'>;

    // Create post and comments
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did get a document for a post if an admin', async function() {
    const { data: doc } = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });

    assert.deepEqual(doc._id, post.document.toString());
    assert.deepEqual(doc.author!._id, user1._id.toString());
    assert.notDeepEqual(doc.template, null);
    assert.deepEqual(typeof doc.template, 'object');
    assert(doc.createdOn > 0);
    assert(doc.lastUpdated > 0);

    // Check the elements
    assert.deepEqual(doc.elements!.length, 1);
    assert.deepEqual(doc.elements![0].zone, 'main');
    assert.deepEqual(doc.elements![0].html, '<p></p>');
    assert.deepEqual(doc.elements![0].parent.toString(), doc._id);
    assert.deepEqual(doc.elements![0].type, 'paragraph');
  });

  // it('did get a document for a post the author', async function() {
  //   const { data: doc } = await header.user1.graphql<Document>(GET_DOCUMENT, { id: post.document });
  //   assert.deepEqual(doc._id, post.document.toString());
  // });

  it('did not get a document for a post when not the author', async function() {
    const { errors } = await header.user2.graphql<Document>(GET_DOCUMENT, { id: post.document });
    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });
});
