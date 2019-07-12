import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { IDraft } from '../../../../src/types/models/i-draft';

let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

describe('[GQL] Testing the editting of document elements: ', function() {
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

  it('did not update an element with a bad document id', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "bad", elementId: "bad", token: { html: "" }) { _id, html } }`
    );

    assert.deepEqual(
      errors[0].message,
      'Expected type ObjectId!, found "bad"; ObjectId must be a single String of 24 hex characters'
    );

    assert.deepEqual(
      errors[1].message,
      'Expected type ObjectId!, found "bad"; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('did not update an element on a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "123456789012345678901234", elementId: "123456789012345678901234", token: { html: "" }) { _id, html } }`
    );

    assert.deepEqual(errors[0].message, 'Could not find resource');
  });

  it('did not update an element on a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${
        document._id
      }", elementId: "123456789012345678901234", token: { html: "" }) { _id, html } }`
    );

    assert.deepEqual(errors[0].message, 'Could not find resource');
  });

  it('did not allow a guest to edit an element', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        document.elements[0]._id
      }", token: { html: "" }) { _id, html } }`
    );

    assert.deepEqual(errors[0].message, 'Authentication Error');
  });

  it('did not allow another user to edit an element', async function() {
    const { errors } = await header.user2.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        document.elements[0]._id
      }", token: { html: "" }) { _id, html } }`
    );

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });

  it('did not allow an element type to be changed', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        document.elements[0]._id
      }", token: { type: ElmHeader1, html: "" }) { _id, html } }`
    );

    assert.deepEqual(errors[0].message, 'You cannot change an element type');
  });

  it('did allow a regular edit opertion', async function() {
    const updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
    const { data: element } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        document.elements[0]._id
      }", token: { zone: "zone-a", html: "${updatedHTML}" }) { _id, html, zone } }`
    );
    assert.deepEqual(element.html, updatedHTML);
    assert.deepEqual(element.zone, 'zone-a');
  });

  it('did allow an admin to edit', async function() {
    const updatedHTML = '<p>This is something else</p>';
    const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        document.elements[0]._id
      }", token: { zone: "zone-a", html: "${updatedHTML}" }) { _id, html, zone } }`
    );
    assert.deepEqual(element.html, updatedHTML);
    assert.deepEqual(element.zone, 'zone-a');
  });

  it('did update the draft html', async function() {
    const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { html } }`
    );
    assert.deepEqual(doc.html['zone-a'], '<p>This is something else</p>');
  });
});
