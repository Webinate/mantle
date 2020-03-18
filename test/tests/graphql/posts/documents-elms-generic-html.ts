// import * as assert from 'assert';
// import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { randomString } from '../../utils';
// import header from '../../header';

// let post: IPost<'expanded'>, document: IDocument<'expanded'>, user1: IUserEntry<'expanded'>;

// describe('[GQL] Testing the adding of generic html elements: ', function() {
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

//   it('did allow an admin to create a an element with an iframe', async function() {
//     const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", token: { html: "<div><iframe src=\\"https://youtube.com\\"></iframe></div>",  type: ElmHtml, zone: "main" }) { _id, type, zone, html } }`
//     );

//     assert.deepEqual(element.type, 'elm-html');
//     assert.deepEqual(element.zone, 'main');
//     assert.deepEqual(element.html, '<div><iframe src="https://youtube.com"></iframe></div>');
//   });

//   it('did allow an admin to create a an element with a script element', async function() {
//     const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(
//       `mutation { addDocElement(id: "${
//         document._id
//       }", token: { html: "<div><script type=\\"text/javascript\\" src=\\"https://youtube.com\\"></script></div>",  type: ElmHtml, zone: "main" }) { _id, type, zone, html } }`
//     );

//     assert.deepEqual(element.type, 'elm-html');
//     assert.deepEqual(element.zone, 'main');
//     assert.deepEqual(element.html, '<div><script type="text/javascript" src="https://youtube.com"></script></div>');
//   });
// });
