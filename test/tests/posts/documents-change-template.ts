import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, ITemplate, IDraft } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import controllerFactory from '../../../src/core/controller-factory';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  user1: IUserEntry<'expanded'>,
  templates: ITemplate<'expanded'>[];

describe( 'Testing the changing of a document template: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } ) as IUserEntry<'expanded'>;
    const templatePage = await controllerFactory.get( 'templates' ).getMany();
    templates = templatePage.data;

    // Create post and comments
    post = await posts.create( {
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } ) as IPost<'expanded'>;

    document = post.document;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did not change the template with a bad doc id', async function() {
    const resp = await header.user1.put( `/api/documents/BAD/set-template/BAD` );
    assert.equal( decodeURIComponent( resp.statusText ), 'Invalid ID format' );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not change the template with a bad template id', async function() {
    const resp = await header.user1.put( `/api/documents/123456789012345678901234/set-template/BAD` );
    assert.equal( decodeURIComponent( resp.statusText ), 'Invalid template ID format' );
    assert.equal( resp.status, 500 );
  } )

  it( 'did not change a document that doesnt exist', async function() {
    const resp = await header.user1.put( `/api/documents/123456789012345678901234/set-template/123456789012345678901234` );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not change a document with a template doesnt exist', async function() {
    const resp = await header.user1.put( `/api/documents/${document._id}/set-template/123456789012345678901234` );
    assert.equal( resp.status, 404 );
  } )

  it( 'did not update a document when not the author', async function() {
    const resp = await header.user2.put( `/api/documents/${document._id}/set-template/${templates[ 1 ]._id}` );
    assert.equal( resp.status, 403 );
  } )

  it( 'did update the document template as well as the current draft', async function() {
    const resp = await header.user1.put( `/api/documents/${document._id}/set-template/${templates[ 1 ]._id}` );
    assert.equal( resp.status, 200 );

    const updatedDoc = await resp.json<IDocument<'expanded'>>();
    const newTemplate = updatedDoc.template;
    const prevTemplate = document.template;
    assert.notDeepEqual( newTemplate._id, prevTemplate );
    assert.deepEqual( newTemplate._id, templates[ 1 ]._id );
  } )

  it( 'did update the document template asan admin', async function() {
    const resp = await header.admin.put( `/api/documents/${document._id}/set-template/${templates[ 0 ]._id}` );
    assert.equal( resp.status, 200 );
  } )
} )