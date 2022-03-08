import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { ADD_DOC_ELEMENT, GET_DOCUMENT, REMOVE_DOC_ELEMENT } from '../../client/requests/documents';
import { AddElementInput, Document } from '../../../src/index';
import { IPost, IUserEntry, IAdminUser } from '../../../src/types';

let post: IPost<'server'>, admin: IUserEntry<'server'>;
const htmls = ['<p>1</p>', '<p>2</p>'];

describe('Testing the adding of multiple elements: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    admin = (await users.getUser({ username: (header.config.adminUser as IAdminUser).username })) as IUserEntry<
      'server'
    >;

    // Create post and comments
    post = await posts.create({
      author: admin!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it(`did create ${htmls.length} elements in fast succession`, async function() {
    const responses = await Promise.all(
      htmls.map(html => {
        return header.admin.graphql<Document>(ADD_DOC_ELEMENT, {
          docId: post.document,
          token: <AddElementInput>{
            html: html,
            zone: 'main',
            type: 'paragraph'
          }
        });
      })
    );

    for (const resp of responses) assert(resp.data._id);
  });

  it(`did get the draft and it has ${htmls.length} elements`, async function() {
    const resp = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(resp.data.elements!.length, htmls.length + 1);
  });

  it(`did remove ${htmls.length} elements in fast succession`, async function() {
    const {
      data: { elements }
    } = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });

    // Its plus 1 because we have an element created by default for the post
    assert.deepEqual(elements!.length, htmls.length + 1);

    let deleteResponses = await Promise.all(
      elements!.map(elm => {
        return header.admin.graphql<boolean>(REMOVE_DOC_ELEMENT, { docId: post.document, elementId: elm._id });
      })
    );

    for (const delRes of deleteResponses) assert.deepEqual(delRes.data, true);

    const afterDeleteResponse = await header.admin.graphql<Document>(GET_DOCUMENT, { id: post.document });
    assert.deepEqual(afterDeleteResponse.data.elements!.length, 0);
  });
});
