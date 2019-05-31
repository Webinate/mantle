import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';

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
            type: ElmParagraph,
            html: "${html}",
            zone: "main"
          }) { _id } }`
        );
      })
    );

    for (const resp of responses) assert(resp.data._id);
  });

  it(`did get the draft and it has ${htmls.length} elements`, async function() {
    const {
      data: { elements }
    } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${post.document._id}") { elements { _id } } }`
    );

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(elements.length, htmls.length + 1);
  });

  it(`did remove ${htmls.length} elements in fast succession`, async function() {
    const {
      data: { elements }
    } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${post.document._id}") { elements { _id } } }`
    );

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(elements.length, htmls.length + 1);

    let deleteResponses = await Promise.all(
      elements.map(elm => {
        return header.user1.graphql<boolean>(
          `mutation { removeDocElement(docId: "${post.document._id}", elementId: "${elm._id}") }`
        );
      })
    );

    for (const delRes of deleteResponses) assert.deepEqual(delRes.data, true);

    const afterDeleteResponse = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${post.document._id}") { elements { _id } } }`
    );

    assert.deepEqual(afterDeleteResponse.data.elements.length, 0);
  });
});
