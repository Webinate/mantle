import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { AddElementInput } from '../../../src/graphql/models/element-type';
import { ElementType } from '../../../src/core/enums';
import { ADD_DOC_ELEMENT, GET_DOCUMENT, REMOVE_DOC_ELEMENT } from '../../../src/graphql/client/requests/documents';

let post: IPost<'server'>;

let firstElm: IDraftElement<'expanded'>;
let secondElm: IDraftElement<'expanded'>;

describe('Testing the order of document elements: ', function() {
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
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did add a new elements and each is added to the end of the order array', async function() {
    const { data: elm1 } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: '<p>A</p>'
      })
    });

    const { data: elm2 } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: '<p>B</p>'
      })
    });

    firstElm = elm1;
    secondElm = elm2;

    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });

    assert.equal(doc.elementsOrder[1], firstElm._id);
    assert.equal(doc.elementsOrder[2], secondElm._id);
  });

  it('did remove an element and the element id was removed from the order array', async function() {
    const { data: elementRemoved } = await header.admin.graphql<boolean>(REMOVE_DOC_ELEMENT, {
      docId: post.document,
      elementId: firstElm._id
    });
    assert.deepEqual(elementRemoved, true);

    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    assert.equal(doc.elementsOrder[1], secondElm._id);
    assert.equal(doc.elementsOrder.length, 2);
  });

  it('did add a new element at an index and the order array was correct', async function() {
    const { data: newElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      index: 1,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: '<p>C</p>'
      })
    });

    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });

    assert.equal(doc.elementsOrder[1], newElement._id);
    assert.equal(doc.elementsOrder[2], secondElm._id);
    assert.equal(doc.elementsOrder.length, 3);
  });

  it('did add an element at an index -1 to the end of the order array', async function() {
    const { data: newElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      index: -1,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: '<p>D</p>'
      })
    });

    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    assert.equal(doc.elementsOrder[3], newElement._id);
  });

  it('did add an element at an index 100 to the end of the order array', async function() {
    const { data: newElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      index: 100,
      token: new AddElementInput({
        type: ElementType.paragraph,
        html: '<p>E</p>'
      })
    });

    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    assert.equal(doc.elementsOrder[4], newElement._id);
  });
});
