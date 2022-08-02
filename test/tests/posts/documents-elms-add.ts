import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { ObjectId } from 'mongodb';
import { ADD_DOC_ELEMENT, GET_DOCUMENT } from '../../client/requests/documents';
import { AddElementInput, Element, Document } from '../../../src/index';
import { IPost, IUserEntry } from '../../../src/types';

let post: IPost<'server'>, documentId: ObjectId, user1: IUserEntry<'server'>;

describe('Testing the adding of document elements: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user3' })) as IUserEntry<'server'>;

    // Create post and comments
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });

    documentId = post.document;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did not add an element with a bad document id', async function() {
    const { errors } = await header.guest.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: 'BAD',
      token: 'BAD',
      index: 'test'
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$docId" got invalid value "BAD"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer'
    );

    assert.deepEqual(
      errors![1].message,
      'Variable "$token" got invalid value "BAD"; Expected type "AddElementInput" to be an object.'
    );

    assert.deepEqual(
      errors![2].message,
      'Variable "$index" got invalid value "test"; Int cannot represent non-integer value: "test"'
    );
  });

  it('did not add an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: '123456789012345678901234',
      token: <AddElementInput>{ type: 'paragraph' }
    });
    assert.deepEqual(errors![0].message, 'Document not found');
  });

  it('did not allow a guest to add an element', async function() {
    const { errors } = await header.guest.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        type: 'paragraph',
        html: ''
      }
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  // This doesnt make sense - admins can change anything :/
  // it('did not allow another user to add an element', async function() {
  //   const { errors } = await header.admin.graphql<Element>(ADD_DOC_ELEMENT, {
  //     docId: documentId,
  //     token: <AddElementInput>({
  //       type: ElementType.paragraph,
  //       html: ''
  //     })
  //   });

  //   assert.deepEqual(errors![0].message, 'You do not have permission');
  // });

  it('did not allow the creation of element without a type', async function() {
    const { errors } = await header.user1.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        html: '<p>Hello world</p>'
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value { html: "<p>Hello world</p>" }; Field "type" of required type "ElementType!" was not provided.'
    );
  });

  it('did not allow the creation of element without a valid type', async function() {
    const { errors } = await header.user1.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        html: '<p>Hello world</p>',
        type: 'BAD' as any
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "BAD" at "token.type"; Value "BAD" does not exist in "ElementType" enum.'
    );
  });

  it('did not allow a regular user to create an element', async function() {
    const { errors } = await header.user1.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        html: '<p>Hello world</p>',
        type: 'paragraph',
        zone: 'zone-a'
      }
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did allow an admin to create some elements', async function() {
    const { data: element } = await header.user3.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        html: '<p>Hello world</p>',
        type: 'paragraph',
        zone: 'zone-a'
      }
    });

    assert.deepEqual(element.type, 'paragraph');
    assert.deepEqual(element.zone, 'zone-a');
    assert.deepEqual(element.html, '<p>Hello world</p>');

    const { errors } = await header.user3.graphql<Element>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: <AddElementInput>{
        html: '<p>This is crazy</p>',
        type: 'paragraph',
        zone: 'zone-a'
      }
    });

    assert.ok(!errors);
  });

  it('did update the draft html', async function() {
    const resp = await header.user3.graphql<Document>(GET_DOCUMENT, { id: documentId });
    const doc = resp.data;
    assert.deepEqual(doc.html['main'], '<p></p>');
    assert.deepEqual(doc.html['zone-a'], '<p>Hello world</p><p>This is crazy</p>');
  });
});
