import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, ITemplate, IAdminUser } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import controllerFactory from '../../../src/core/controller-factory';
import { CHANGE_DOC_TEMPLATE } from '../../../src/graphql/client/requests/documents';
import { ObjectID } from 'mongodb';

let post: IPost<'server'>,
  document: IDocument<'server'>,
  documentId: ObjectID,
  user1: IUserEntry<'server'>,
  templates: ITemplate<'server'>[];

describe('[GQL] Testing the changing of a document template: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: (header.config.adminUser as IAdminUser).username })) as IUserEntry<
      'server'
    >;
    const templatePage = await controllerFactory.get('templates').getMany();
    templates = templatePage.data;

    // Create post and comments
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });

    documentId = post.document;
    document = (await controllerFactory.get('documents').get({ docId: documentId })) as IDocument<'server'>;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  it('did not change the template with a bad doc or template id', async function() {
    const { errors } = await header.admin.graphql<IDocument<'expanded'>>(CHANGE_DOC_TEMPLATE, {
      template: 'BAD',
      id: 'BAD'
    });

    assert.equal(
      errors![0].message,
      'Variable "$template" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );

    assert.equal(
      errors![1].message,
      'Variable "$id" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('did not change a document that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IDocument<'expanded'>>(CHANGE_DOC_TEMPLATE, {
      id: '123456789012345678901234',
      template: '123456789012345678901234'
    });
    assert.equal(errors![0].message, 'Document not found');
  });

  it('did not change a document with a template doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IDocument<'expanded'>>(CHANGE_DOC_TEMPLATE, {
      id: documentId,
      template: '123456789012345678901234'
    });
    assert.equal(errors![0].message, 'Template not found');
  });

  it('did not update a document when not the author', async function() {
    const { errors } = await header.user2.graphql<IDocument<'expanded'>>(CHANGE_DOC_TEMPLATE, {
      id: documentId,
      template: templates[1]._id
    });
    assert.equal(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did update the document template as well as the current draft', async function() {
    const { data: wasChanged } = await header.admin.graphql<boolean>(CHANGE_DOC_TEMPLATE, {
      id: documentId,
      template: templates[1]._id
    });

    assert.ok(wasChanged);

    const updatedDoc = (await controllerFactory.get('documents').get({ docId: documentId })) as IDocument<'server'>;
    assert.notDeepEqual(updatedDoc.template.toString(), document.template.toString());
    assert.deepEqual(updatedDoc.template.toString(), templates[1]._id.toString());
  });

  it('did update the document template as an admin', async function() {
    const { data: updatedDoc } = await header.admin.graphql<IDocument<'expanded'>>(CHANGE_DOC_TEMPLATE, {
      id: documentId,
      template: templates[1]._id
    });

    assert(updatedDoc);
  });
});
