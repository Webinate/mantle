import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { IDraft } from '../../../../src/types/models/i-draft';

let post: IPost<'expanded'>, user1: IUserEntry<'expanded'>;
const htmls = ['<p>1</p>', '<p>2</p>'];

describe('[GQL] Testing the adding of multiple elements: ', function() {
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
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it(`did create ${htmls.length} elements in fast succession`, async function() {
    const responses = await Promise.all(
      htmls.map(html => {
        return header.user1.graphql<IDocument<'expanded'>>(
          `mutation { addDocElement(id: "${post.document._id}", token: {
            type: "elm-paragraph",
            html: "${html}",
            zone: "main"
          }) { _id } }`
        );
      })
    );

    for (const resp of responses) assert(resp.data._id);

    // const responses = await Promise.all(
    //   htmls.map(html => {
    //     return header.admin.post(`/api/documents/${post.document._id}/elements`, {
    //       type: 'elm-paragraph',
    //       html: html,
    //       zone: 'main'
    //     } as IDraftElement<'client'>);
    //   })
    // );

    // for (const resp of responses) assert.equal(resp.status, 200);
  });

  it(`did get the draft and it has ${htmls.length} elements`, async function() {
    const resp = await header.user1.get(`/api/documents/${post.document._id}`);
    assert.equal(resp.status, 200);
    const docJson = await resp.json<IDocument<'expanded'>>();

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(docJson.elements.length, htmls.length + 1);
  });

  it(`did remove ${htmls.length} elements in fast succession`, async function() {
    let resp = await header.user1.get(`/api/documents/${post.document._id}`);
    assert.equal(resp.status, 200);
    let docJson = await resp.json<IDocument<'expanded'>>();

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(docJson.elements.length, htmls.length + 1);

    let deleteResponses = await Promise.all(
      docJson.elements.map(elm => {
        return header.admin.delete(`/api/documents/${post.document._id}/elements/${elm._id}`);
      })
    );

    for (const delRes of deleteResponses) assert.deepEqual(delRes.status, 204);

    resp = await header.user1.get(`/api/documents/${post.document._id}`);
    assert.equal(resp.status, 200);
    docJson = await resp.json<IDocument<'expanded'>>();

    assert.deepEqual(docJson.elements.length, 0);
  });
});
