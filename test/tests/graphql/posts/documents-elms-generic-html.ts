import * as assert from 'assert';
import { IPost, IUserEntry, IDraftElement } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import { ADD_DOC_ELEMENT } from '../../../../src/graphql/client/requests/documents';
import { ElementType } from '../../../../src/core/enums';
import { AddElementInput } from '../../../../src/graphql/models/element-type';

let post: IPost<'server'>, user1: IUserEntry<'server'>;

describe('[GQL] Testing the adding of generic html elements: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'server'>;

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

  it('did allow an admin to create a an element with an iframe', async function() {
    const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        html: '<div><iframe src="https://youtube.com"></iframe></div>',
        type: ElementType.html,
        zone: 'main'
      })
    });

    assert.deepEqual(element.type, 'html');
    assert.deepEqual(element.zone, 'main');
    assert.deepEqual(element.html, '<div><iframe src="https://youtube.com"></iframe></div>');
  });

  it('did allow an admin to create a an element with a script element', async function() {
    const { data: element } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        html: '<div><script type="text/javascript" src="https://youtube.com"></script></div>',
        type: ElementType.html,
        zone: 'main'
      })
    });

    assert.deepEqual(element.type, 'html');
    assert.deepEqual(element.zone, 'main');
    assert.deepEqual(element.html, '<div><script type="text/javascript" src="https://youtube.com"></script></div>');
  });
});
