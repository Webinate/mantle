import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, ITemplate } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import controllerFactory from '../../../../src/core/controller-factory';
import { documentFragment } from '../fragments';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  user1: IUserEntry<'expanded'>,
  templates: ITemplate<'expanded'>[];

describe('[GQL] Testing the changing of a document template: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'expanded'>;
    const templatePage = await controllerFactory.get('templates').getMany();
    templates = templatePage.data;

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

  it('did not change the template with a bad doc or template id', async function() {
    const { errors } = await header.user1.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "BAD", template: "BAD") { _id } }`
    );

    assert.equal(
      errors[0].message,
      'Expected type ObjectId!, found "BAD"; ObjectId must be a single String of 24 hex characters'
    );

    assert.equal(
      errors[1].message,
      'Expected type ObjectId!, found "BAD"; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('did not change a document that doesnt exist', async function() {
    const { errors } = await header.user1.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "123456789012345678901234", template: "123456789012345678901234") { _id } }`
    );
    assert.equal(errors[0].message, 'Document not found');
  });

  it('did not change a document with a template doesnt exist', async function() {
    const { errors } = await header.user1.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "${document._id}", template: "123456789012345678901234") { _id } }`
    );
    assert.equal(errors[0].message, 'Template not found');
  });

  it('did not update a document when not the author', async function() {
    const { errors } = await header.user2.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "${document._id}", template: "${templates[1]._id}") { _id } }`
    );
    assert.equal(errors[0].message, 'You do not have permission');
  });

  it('did update the document template as well as the current draft', async function() {
    const { data: updatedDoc } = await header.user1.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "${document._id}", template: "${templates[1]._id}") {
        ...DocumentFields, template { _id } } } ${documentFragment}`
    );
    assert.notDeepEqual(updatedDoc.template._id, document.template._id);
    assert.deepEqual(updatedDoc.template._id, templates[1]._id);
  });

  it('did update the document template as an admin', async function() {
    const { data: updatedDoc } = await header.admin.graphql<IDocument<'expanded'>>(
      `mutation { changeDocTemplate(id: "${document._id}", template: "${templates[1]._id}") { _id } }`
    );

    assert(updatedDoc);
  });
});
