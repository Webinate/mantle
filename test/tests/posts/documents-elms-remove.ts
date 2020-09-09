import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { REMOVE_DOC_ELEMENT, GET_DOCUMENT } from '../../../src/graphql/client/requests/documents';
import { Document } from '../../../src/client-models';
import { IPost } from '../../../src/types/models/i-post';
import { IUserEntry } from '../../../src/types/models/i-user-entry';

let post: IPost<'server'>, document: Document;

describe('Testing the deletion of document elements: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'server'>;

    // Create post and comments
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });

    const resp = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });
    document = resp.data;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did not remove an element with a bad document id', async function() {
    const { errors } = await header.guest.graphql<boolean>(REMOVE_DOC_ELEMENT, { docId: 'bad', elementId: 'bad' });

    assert.deepEqual(
      errors![0].message,
      'Variable "$docId" got invalid value "bad"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );

    assert.deepEqual(
      errors![1].message,
      'Variable "$elementId" got invalid value "bad"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('did not remove an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_DOC_ELEMENT, {
      docId: '123456789012345678901234',
      elementId: '123456789012345678901234'
    });
    assert.deepEqual(errors![0].message, 'Document not found');
  });

  it('did not delete an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_DOC_ELEMENT, {
      docId: post.document,
      elementId: '123456789012345678901234'
    });
    assert.deepEqual(errors![0].message, 'Could not find resource');
  });

  it('did not allow a guest to remove an element', async function() {
    const { errors } = await header.guest.graphql<boolean>(REMOVE_DOC_ELEMENT, {
      docId: post.document,
      elementId: document.elements![0]._id
    });
    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  // it('did not allow another user to remove an element', async function() {
  //   const { errors } = await header.user2.graphql<boolean>( REMOVE_DOC_ELEMENT, { docId: post.document, elementId: document.elements[0] });
  //   assert.deepEqual(errors![0].message, 'You do not have permission');
  // });

  it('did allow an admin user to delete the unit', async function() {
    const { data: fileRemoved } = await header.admin.graphql<boolean>(REMOVE_DOC_ELEMENT, {
      docId: post.document,
      elementId: document.elements![0]._id
    });
    assert.deepEqual(fileRemoved, true);
  });

  it('did update the draft html', async function() {
    const { data: doc } = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });

    assert.ok(Object.keys(doc.html).length === 0 && doc.html.constructor === Object);
  });
});
