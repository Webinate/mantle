import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { IPopulatedDraft } from '../../../src/types/models/i-draft';
import Agent from '../agent';
import { DraftElements } from '../../../src';

let post: IPost<'client'>,
  document: IDocument<'client'>,
  curDraft: IPopulatedDraft<'client'>,
  user1: IUserEntry<'client'>;

let common = [
  '<ul><li>test</li></ul>',
  '<img src="" />',
  '<div></div>',
  '<script src="" />',
  '<video></video>',
  '<iframe></iframe>'
];
let commonExtended = [
  ...common,
  '<h1></h1>',
  '<h2></h2>',
  '<h3></h3>',
  '<h4></h4>',
  '<h5></h5>'
];

describe( 'Testing the validation of document element html: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } );

    // Create post and comments
    post = await posts.create( {
      author: user1!._id,
      content: 'This is a temp post',
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } );

    document = post.document as IDocument<'client'>;
    curDraft = document.currentDraft as IPopulatedDraft<'client'>;
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'did not allow common blocks in a p element', async function() {
    await insertCommonHtml( header.user1, 'elm-paragraph', 'p', commonExtended );
  } )

  it( 'did allow text inside a code element', async function() {
    const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-paragraph', html: `<p>Test</p>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );
  } )

  it( 'did not allow common blocks in a code element', async function() {
    await insertCommonHtml( header.user1, 'elm-code', 'pre', commonExtended.filter( f => f !== '<pre></pre>' ) );
  } )

  it( 'did allow text inside a code element', async function() {
    const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-code', html: `<pre>Test</pre>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );
  } )

  it( 'did not allow common blocks inside a h1 element', async function() {
    await insertCommonHtml( header.user1, 'elm-header', 'h1', common );
  } )

  it( 'did allow text inside a h1 element', async function() {
    const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-header', html: `<h1>Test</h1>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );
  } )

  it( 'did not allow common blocks inside a h2 element', async function() {
    await insertCommonHtml( header.user1, 'elm-header', 'h2', common );
  } )

  it( 'did allow text inside a h2 element', async function() {
    const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-header', html: `<h2>Test</h2>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );
  } )

  it( 'did not allow common blocks inside a ul or ol element', async function() {
    await insertCommonHtml( header.user1, 'elm-list', 'ul', commonExtended.filter( f => f !== '<ul><li>test</li></ul>' ) );
    await insertCommonHtml( header.user1, 'elm-list', 'ol', commonExtended.filter( f => f !== '<ul><li>test</li></ul>' ) );
  } )

  it( 'did allow basic list elements', async function() {
    let response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-list', html: `<ul><li>thing</li></ul>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );

    response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-list', html: `<ol><li>thing</li></ol>` } as IDraftElement<'client'> );
    assert.equal( response.status, 200 );
  } )
} )

async function insertCommonHtml( agent: Agent, elmType: DraftElements, outerElm: string, innerTests: string[] ) {
  const response = await Promise.all( innerTests.map( snippet => {
    return agent.post( `/api/documents/${document._id}/elements`, { type: elmType, html: `<${outerElm}>${snippet}</${outerElm}>` } as IDraftElement<'client'> );
  } ) );

  for ( let i = 0, l = response.length; i < l; i++ ) {
    assert.equal( response[ i ].status, 500 );
    assert.equal( decodeURIComponent( response[ i ].statusText ), "'html' has html code that is not allowed" );
  }
}