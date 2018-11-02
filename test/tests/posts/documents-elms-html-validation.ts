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

const blocks = [
  '<ul><li>test</li></ul>',
  '<ol><li>test</li></ol>',
  '<figure><img src="" />< /figure>',
  '<img src="" />',
  '<pre>thing</pre>',
  '<div>Not allowed</div>',
  '<script src="bad" />',
  '<blockquote></blockquote>',
  '<table><thead><th>HEADER</th></thead><tbody><tr><td>DATA</td></tr></tbody></table>',
  '<caption></caption>',
  '<video></video>',
  '<iframe src></iframe>',
  '<h1></h1>',
  '<h2></h2>',
  '<h3></h3>',
  '<h4></h4>',
  '<h5></h5>'
];

const inlines = [
  '<span>Regular text</span>',
  '<br />',
  '<hr />',
  '<strong>bold</strong>',
  '<strike>bold</strike>',
  '<em>bold</em>',
  '<i>allowed</i>',
  '<u>bold</u>',
  '<a href="https://other.com">bold</a>'
];

const testConfig: {
  type: DraftElements,
  pre: string,
  post: string,
  allowed: string[],
  disallowed: string[]
}[] = [
    { type: 'elm-paragraph', pre: '<p>', post: '</p>', allowed: [ ...inlines ], disallowed: [ ...blocks ] },
    { type: 'elm-code', pre: '<pre>', post: '</pre>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 4 ) },
    { type: 'elm-list', pre: '<ul>', post: '</ul>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 0 && i !== 1 ) },
    { type: 'elm-header-1', pre: '<h1>', post: '</h1>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 12 ) },
    { type: 'elm-header-2', pre: '<h2>', post: '</h2>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 13 ) },
    { type: 'elm-header-3', pre: '<h3>', post: '</h3>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 14 ) },
    { type: 'elm-header-4', pre: '<h4>', post: '</h4>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 15 ) },
    { type: 'elm-header-5', pre: '<h5>', post: '</h5>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 16 ) },
    { type: 'elm-header-6', pre: '<h6>', post: '</h6>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 17 ) }
  ]



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

  testConfig.forEach( test => {

    describe( `Tests for [${test.type}]: `, function() {

      describe( `Allowed: `, function() {
        test.allowed.forEach( innerHtml => {

          it( `did allowed ${innerHtml}`, async function() {

            const response = await header.user1.post( `/api/documents/${document._id}/elements`, {
              type: test.type,
              html: `${test.pre}${innerHtml}${test.post}`
            } as IDraftElement<'client'> );

            assert.equal( response.status, 200 );
          } )
        } )
      } )

      describe( `Disallowed: `, function() {

        test.disallowed.forEach( innerHtml => {

          it( `did not allow ${innerHtml}`, async function() {

            const response = await header.user1.post( `/api/documents/${document._id}/elements`, {
              type: test.type,
              html: `${test.pre}${innerHtml}${test.post}`
            } as IDraftElement<'client'> );

            assert.equal( response.status, 500 );
            assert.equal( decodeURIComponent( response.statusText ), "'html' has html code that is not allowed" );
          } )
        } )

      } )
    } )




  } )

  // it( 'did not allow common blocks in a p element', async function() {
  //   await insertCommonHtml( header.user1, 'elm-paragraph', 'p', commonExtended );
  // } )

  // it( 'did allow text inside a code element', async function() {
  //   const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-paragraph', html: `<p>Test</p>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );
  // } )

  // it( 'did not allow common blocks in a code element', async function() {
  //   await insertCommonHtml( header.user1, 'elm-code', 'pre', commonExtended.filter( f => f !== '<pre></pre>' ) );
  // } )

  // it( 'did allow text inside a code element', async function() {
  //   const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-code', html: `<pre>Test</pre>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );
  // } )

  // it( 'did not allow common blocks inside a h1 element', async function() {
  //   await insertCommonHtml( header.user1, 'elm-header', 'h1', commonBlocks );
  // } )

  // it( 'did allow text inside a h1 element', async function() {
  //   const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-header', html: `<h1>Test</h1>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );
  // } )

  // it( 'did not allow common blocks inside a h2 element', async function() {
  //   await insertCommonHtml( header.user1, 'elm-header', 'h2', commonBlocks );
  // } )

  // it( 'did allow text inside a h2 element', async function() {
  //   const response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-header', html: `<h2>Test</h2>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );
  // } )

  // it( 'did not allow common blocks inside a ul or ol element', async function() {
  //   await insertCommonHtml( header.user1, 'elm-list', 'ul', commonExtended.filter( f => f !== '<ul><li>test</li></ul>' ) );
  //   await insertCommonHtml( header.user1, 'elm-list', 'ol', commonExtended.filter( f => f !== '<ul><li>test</li></ul>' ) );
  // } )

  // it( 'did allow basic list elements', async function() {
  //   let response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-list', html: `<ul><li>thing</li></ul>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );

  //   response = await header.user1.post( `/api/documents/${document._id}/elements`, { type: 'elm-list', html: `<ol><li>thing</li></ol>` } as IDraftElement<'client'> );
  //   assert.equal( response.status, 200 );
  // } )
} )

// async function insertCommonHtml( agent: Agent, elmType: DraftElements, outerElm: string, innerTests: string[] ) {
//   const response = await Promise.all( innerTests.map( snippet => {
//     return agent.post( `/api/documents/${document._id}/elements`, { type: elmType, html: `<${outerElm}>${snippet}</${outerElm}>` } as IDraftElement<'client'> );
//   } ) );

//   for ( let i = 0, l = response.length; i < l; i++ ) {
//     assert.equal( response[ i ].status, 500 );
//     assert.equal( decodeURIComponent( response[ i ].statusText ), "'html' has html code that is not allowed" );
//   }
// }