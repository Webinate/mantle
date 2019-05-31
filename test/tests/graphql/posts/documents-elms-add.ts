import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';

let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

describe('[GQL] Testing the adding of document elements: ', function() {
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

  it('did not add an element with a bad document id', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "bad") { _id } }`
    );

    assert.deepEqual(
      errors[0].message,
      'Expected type ObjectId!, found "bad"; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('did not add an element on a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "123456789012345678901234", token: {}) { _id } }`
    );

    assert.deepEqual(errors[0].message, 'Document not found');
  });

  it('did not allow a guest to add an element', async function() {
    const { errors } = await header.guest.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: { html: "" }) { _id } }`
    );

    assert.deepEqual(errors[0].message, 'Authentication Error');
  });

  it('did not allow another user to add an element', async function() {
    const { errors } = await header.user2.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: { html: "" }) { _id } }`
    );

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });

  it('did not allow the creation of element without a type', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: { html: "<p>Hello world</p>" }) { _id } }`
    );

    assert.deepEqual(errors[0].message, 'You must specify an element type');
  });

  it('did not allow the creation of element without a valid type', async function() {
    const { errors } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: { html: "<p>Hello world</p>",  type: "BAD" }) { _id } }`
    );

    assert.deepEqual(errors[0].message, 'Expected type ElementTypeEnum, found "BAD".');
  });

  it('did create a regular element', async function() {
    const { data: element } = await header.user1.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${
        document._id
      }", token: { html: "<p>Hello world</p>",  type: ElmParagraph, zone: "zone-a" }) { _id, type, zone, html } }`
    );

    assert.deepEqual(element.type, 'elm-paragraph');
    assert.deepEqual(element.zone, 'zone-a');
    assert.deepEqual(element.html, '<p>Hello world</p>');
  });

  it('did allow an admin to create a regular element', async function() {
    const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(
      `mutation { addDocElement(id: "${
        document._id
      }", token: { html: "<p>Hello world 2</p>",  type: ElmParagraph, zone: "zone-a" }) { _id, type, zone, html } }`
    );

    assert.deepEqual(element.type, 'elm-paragraph');
    assert.deepEqual(element.zone, 'zone-a');
    assert.deepEqual(element.html, '<p>Hello world 2</p>');
  });

  it('did update the draft html', async function() {
    const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { html } }`
    );
    assert.deepEqual(doc.html['main'], '<p></p>');
    assert.deepEqual(doc.html['zone-a'], '<p>Hello world</p><p>Hello world 2</p>');
  });
});
