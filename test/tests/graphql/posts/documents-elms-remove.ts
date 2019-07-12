import * as assert from 'assert';
import { IPost, IDocument, IUserEntry } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { IDraft } from '../../../../src/types/models/i-draft';

let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

describe('[GQL] Testing the deletion of document elements: ', function() {
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

  it('did not remove an element with a bad document id', async function() {
    const { errors } = await header.guest.graphql<boolean>(
      `mutation{ removeDocElement(docId: "bad", elementId: "bad") }`
    );

    assert.deepEqual(
      errors[0].message,
      'Expected type ObjectId!, found "bad"; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('did not remove an element on a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<boolean>(
      `mutation{ removeDocElement(docId: "123456789012345678901234", elementId: "123456789012345678901234") }`
    );
    assert.deepEqual(errors[0].message, 'Document not found');
  });

  it('did not delete an element on a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<boolean>(
      `mutation{ removeDocElement(docId: "${document._id}", elementId: "123456789012345678901234") }`
    );
    assert.deepEqual(errors[0].message, 'Could not find resource');
  });

  it('did not allow a guest to remove an element', async function() {
    const { errors } = await header.guest.graphql<boolean>(
      `mutation{ removeDocElement(docId: "${document._id}", elementId: "${document.elements[0]._id}") }`
    );

    assert.deepEqual(errors[0].message, 'Authentication Error');
  });

  it('did not allow another user to remove an element', async function() {
    const { errors } = await header.user2.graphql<boolean>(
      `mutation{ removeDocElement(docId: "${document._id}", elementId: "${document.elements[0]._id}") }`
    );

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });

  it('did allow a regular user to delete the unit', async function() {
    const { data: fileRemoved } = await header.user1.graphql<boolean>(
      `mutation{ removeDocElement(docId: "${document._id}", elementId: "${document.elements[0]._id}") }`
    );

    assert.deepEqual(fileRemoved, true);
  });

  it('did update the draft html', async function() {
    const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { html } }`
    );

    assert.deepEqual(doc.html, undefined);
  });
});
