import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { ObjectID } from 'mongodb';
import { ADD_DOC_ELEMENT, GET_DOCUMENT } from '../../../../src/graphql/client/requests/documents';
import { AddElementInput } from '../../../../src/graphql/models/element-type';
import { ElementType } from '../../../../src/core/enums';

let post: IPost<'server'>, documentId: ObjectID, user1: IUserEntry<'server'>;

describe('[GQL] Testing the adding of document elements: ', function() {
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
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: 'BAD',
      token: 'BAD',
      index: 'test'
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$docId" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );

    assert.deepEqual(
      errors![1].message,
      'Variable "$token" got invalid value "BAD"; Expected type AddElementInput to be an object.'
    );

    assert.deepEqual(
      errors![2].message,
      'Variable "$index" got invalid value "test"; Expected type Int. Int cannot represent non-integer value: "test"'
    );
  });

  it('did not add an element on a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: '123456789012345678901234',
      token: new AddElementInput({ type: ElementType.paragraph })
    });
    assert.deepEqual(errors![0].message, 'Document not found');
  });

  it('did not allow a guest to add an element', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: ''
      })
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  // This doesnt make sense - admins can change anything :/
  // it('did not allow another user to add an element', async function() {
  //   const { errors } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
  //     docId: documentId,
  //     token: new AddElementInput({
  //       type: ElementType.paragraph,
  //       html: ''
  //     })
  //   });

  //   assert.deepEqual(errors![0].message, 'You do not have permission');
  // });

  it('did not allow the creation of element without a type', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        html: '<p>Hello world</p>'
      })
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value { html: "<p>Hello world</p>" }; Field type of required type ElementType! was not provided.'
    );
  });

  it('did not allow the creation of element without a valid type', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        html: '<p>Hello world</p>',
        type: 'BAD' as any
      })
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "BAD" at "token.type"; Expected type ElementType.'
    );
  });

  it('did not allow a regular user to create an element', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        html: '<p>Hello world</p>',
        type: ElementType.paragraph,
        zone: 'zone-a'
      })
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did allow an admin to create some elements', async function() {
    const { data: element } = await header.user3.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        html: '<p>Hello world</p>',
        type: ElementType.paragraph,
        zone: 'zone-a'
      })
    });

    assert.deepEqual(element.type, 'paragraph');
    assert.deepEqual(element.zone, 'zone-a');
    assert.deepEqual(element.html, '<p>Hello world</p>');

    const { errors } = await header.user3.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: documentId,
      token: new AddElementInput({
        html: '<p>This is crazy</p>',
        type: ElementType.paragraph,
        zone: 'zone-a'
      })
    });

    assert.ok(!errors);
  });

  it('did update the draft html', async function() {
    const resp = await header.user3.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: documentId });
    const doc = resp.data;
    assert.deepEqual(doc.html['main'], '<p></p>');
    assert.deepEqual(doc.html['zone-a'], '<p>Hello world</p><p>This is crazy</p>');
  });
});
