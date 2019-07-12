import * as assert from 'assert';
import { IPost, IDocument, IUserEntry } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';

let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

describe('[GQL] Testing the fetching of documents: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'expanded'>;

    // Create post and comments
    post = (await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'expanded'>;

    document = post.document;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did get a document for a post if an admin', async function() {
    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${
        document._id
      }") { _id, elements { zone, html, parent { _id }, type }, html, createdOn, lastUpdated, author { _id }, template { _id } } }`
    );

    assert.deepEqual(doc._id, document._id);
    assert.deepEqual(doc.author._id, user1._id);
    assert.notDeepEqual(doc.template, null);
    assert.deepEqual(typeof doc.template, 'object');
    assert(doc.createdOn > 0);
    assert(doc.lastUpdated > 0);

    // Check the elements
    assert.deepEqual(doc.elements.length, 1);
    assert.deepEqual(doc.elements[0].zone, 'main');
    assert.deepEqual(doc.elements[0].html, '<p></p>');
    assert.deepEqual(doc.elements[0].parent._id, doc._id);
    assert.deepEqual(doc.elements[0].type, 'elm-paragraph');
  });

  it('did get a document for a post the author', async function() {
    const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { _id } }`
    );
    assert.deepEqual(doc._id, document._id);
  });

  it('did not get a document for a post when not the author', async function() {
    const { errors } = await header.user2.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { _id } }`
    );

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });
});
