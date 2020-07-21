import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { UPDATE_DOC_ELEMENT, GET_DOCUMENT } from '../../../src/graphql/client/requests/documents';
import { UpdateElementInput } from '../../../src/graphql/models/element-type';

let post: IPost<'server'>, document: IDocument<'expanded'>;

describe('Testing the editting of document elements: ', function() {
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

    const { data } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    document = data;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did not update an element with a bad document id', async function() {
    const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: 'bad',
        html: ''
      }),
      docId: 'bad'
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$docId" got invalid value "bad"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );

    assert.deepEqual(
      errors![1].message,
      'Variable "$token" got invalid value "bad" at "token._id"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('did not update an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: '123456789012345678901234',
        html: ''
      }),
      docId: '123456789012345678901234'
    });

    assert.deepEqual(errors![0].message, 'Could not find resource');
  });

  it('did not update an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: '123456789012345678901234',
        html: ''
      }),
      docId: post.document
    });

    assert.deepEqual(errors![0].message, 'Could not find resource');
  });

  it('did not allow a guest to edit an element', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: document.elements[0]._id,
        html: ''
      }),
      docId: post.document
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did not allow another user to edit an element', async function() {
    const { errors } = await header.user2.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: document.elements[0]._id,
        html: ''
      }),
      docId: post.document
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  // it('did not allow an element type to be changed', async function() {
  //   const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(
  //     `mutation { updateDocElement(id: "${document._id}", elementId: "${document.elements[0]._id}", token: { type: ElmHeader1, html: "" }) { _id, html } }`
  //   );

  //   assert.deepEqual(errors![0].message, 'You cannot change an element type');
  // });

  it('did allow a regular edit opertion', async function() {
    const updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
    const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      token: new UpdateElementInput({
        _id: document.elements[0]._id,
        html: updatedHTML,
        zone: 'zone-a'
      }),
      docId: post.document
    });
    assert.deepEqual(element.html, updatedHTML);
    assert.deepEqual(element.zone, 'zone-a');
  });

  // it('did allow an admin to edit', async function() {
  //   const updatedHTML = '<p>This is something else</p>';
  //   const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(
  //     `mutation { updateDocElement(id: "${document._id}", elementId: "${document.elements[0]._id}", token: { zone: "zone-a", html: "${updatedHTML}" }) { _id, html, zone } }`
  //   );
  //   assert.deepEqual(element.html, updatedHTML);
  //   assert.deepEqual(element.zone, 'zone-a');
  // });

  it('did update the draft html', async function() {
    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    assert.deepEqual(doc.html['zone-a'], '<p>This is something <strong>new</strong> and <u>exciting</u></p>');
  });
});
