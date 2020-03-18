// import * as assert from 'assert';
// import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { randomString } from '../../utils';
// import header from '../../header';

// let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

// let firstElm: IDraftElement<'expanded'>;
// let secondElm: IDraftElement<'expanded'>;

// describe('[GQL] Testing the order of document elements: ', function() {
//   before(async function() {
//     const posts = ControllerFactory.get('posts');
//     const users = ControllerFactory.get('users');
//     user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'expanded'>;

//     // Create post and comments
//     post = (await posts.create({
//       author: user1!._id,
//       slug: randomString(),
//       title: 'Temp Post',
//       public: true
//     })) as IPost<'expanded'>;

//     document = post.document;
//   });

//   after(async function() {
//     const posts = ControllerFactory.get('posts');
//     await posts.removePost(post._id);
//   });

//   it('did add a new elements and each is added to the end of the order array', async function() {
//     const { data: elm1 } = await header.user1.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", token: { type: ElmParagraph, html: "<p>A</p>", }) { _id, html } }`
//     );
//     const { data: elm2 } = await header.user1.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", token: { type: ElmParagraph, html: "<p>B</p>", }) { _id, html } }`
//     );

//     firstElm = elm1;
//     secondElm = elm2;

//     const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${document._id}") { elementsOrder } }`
//     );

//     assert.equal(doc.elementsOrder[1], firstElm._id);
//     assert.equal(doc.elementsOrder[2], secondElm._id);
//   });

//   it('did remove an element and the element id was removed from the order array', async function() {
//     const { data: elementRemoved } = await header.user1.graphql<boolean>(
//       `mutation{ removeDocElement(docId: "${document._id}", elementId: "${firstElm._id}") }`
//     );

//     assert.deepEqual(elementRemoved, true);

//     const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${document._id}") { elementsOrder } }`
//     );

//     assert.equal(doc.elementsOrder[1], secondElm._id);
//     assert.equal(doc.elementsOrder.length, 2);
//   });

//   it('did add a new element at an index and the order array was correct', async function() {
//     const { data: newElement } = await header.user1.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", index: 1, token: { type: ElmParagraph, html: "<p>C</p>", }) { _id, html } }`
//     );

//     const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${document._id}") { elementsOrder } }`
//     );

//     assert.equal(doc.elementsOrder[1], newElement._id);
//     assert.equal(doc.elementsOrder[2], secondElm._id);
//     assert.equal(doc.elementsOrder.length, 3);
//   });

//   it('did add an element at an index -1 to the end of the order array', async function() {
//     const { data: newElement } = await header.user1.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", index: -1, token: { type: ElmParagraph, html: "<p>D</p>", }) { _id, html } }`
//     );

//     const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${document._id}") { elementsOrder } }`
//     );

//     assert.equal(doc.elementsOrder[3], newElement._id);
//   });

//   it('did add an element at an index 100 to the end of the order array', async function() {
//     const { data: newElement } = await header.user1.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", index: 100, token: { type: ElmParagraph, html: "<p>E</p>", }) { _id, html } }`
//     );

//     const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
//       `{ getDocument(id: "${document._id}") { elementsOrder } }`
//     );

//     assert.equal(doc.elementsOrder[4], newElement._id);
//   });
// });
