import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IDocument, IUserEntry, IDraftElement, DraftElements } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  user1: IUserEntry<'expanded'>;

const blocks: {
  source: string;
  replacedWith: null | { [ testType: string ]: string; }
}[] = [
    { source: '<ul><li></li></ul>', replacedWith: null },
    { source: '<ol><li></li></ol>', replacedWith: null },
    { source: '<figure><img src="" /></figure>', replacedWith: null },
    { source: '<img src="" />', replacedWith: null },
    { source: '<pre></pre>', replacedWith: null },
    { source: '<div></div>', replacedWith: null },
    { source: '<script src="bad" />', replacedWith: null },
    { source: '<table><thead><th></th></thead><tbody><tr><td></td></tr></tbody></table>', replacedWith: null },
    { source: '<caption></caption>', replacedWith: null },
    { source: '<video></video>', replacedWith: null },
    { source: '<iframe src></iframe>', replacedWith: null },
    { source: '<h1></h1>', replacedWith: { 'elm-paragraph': '<p></p><p></p>' } },
    { source: '<h2></h2>', replacedWith: { 'elm-paragraph': '<p></p><p></p>' } },
    { source: '<h3></h3>', replacedWith: { 'elm-paragraph': '<p></p><p></p>' } },
    { source: '<h4></h4>', replacedWith: { 'elm-paragraph': '<p></p><p></p>' } },
    { source: '<h5></h5>', replacedWith: { 'elm-paragraph': '<p></p><p></p>' } }
  ];

const inlines = [
  '<span>Regular text</span>',
  '<br />',
  '<hr />',
  '<strong>bold</strong>',
  '<strike>bold</strike>',
  '<em>bold</em>',
  '<i>allowed</i>',
  '<blockquote></blockquote>',
  '<u>bold</u>',
  '<a href="https://other.com">bold</a>'
];

const testConfig: {
  type: DraftElements,
  pre: string,
  post: string,
  allowed: string[],
  disallowed: { source: string, replacedWith: null | { [ testType: string ]: string; } }[]
}[] = [
    { type: 'elm-paragraph', pre: '<p>', post: '</p>', allowed: [ ...inlines ], disallowed: [ ...blocks ] },
    { type: 'elm-code', pre: '<pre>', post: '</pre>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 4 ) },
    { type: 'elm-list', pre: '<ul>', post: '</ul>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 0 && i !== 1 ) },
    { type: 'elm-header-1', pre: '<h1>', post: '</h1>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 11 ) },
    { type: 'elm-header-2', pre: '<h2>', post: '</h2>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 12 ) },
    { type: 'elm-header-3', pre: '<h3>', post: '</h3>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 13 ) },
    { type: 'elm-header-4', pre: '<h4>', post: '</h4>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 14 ) },
    { type: 'elm-header-5', pre: '<h5>', post: '</h5>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 15 ) },
    { type: 'elm-header-6', pre: '<h6>', post: '</h6>', allowed: [ ...inlines ], disallowed: [ ...blocks ].filter( ( v, i ) => i !== 16 ) }
  ]



describe( 'Testing the validation of document element html: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    user1 = await users.getUser( { username: 'user1' } ) as IUserEntry<'expanded'>;

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

        test.disallowed.forEach( disallowedTest => {

          it( `did not allow ${disallowedTest.source}`, async function() {

            const response = await header.user1.post( `/api/documents/${document._id}/elements`, {
              type: test.type,
              html: `${test.pre}${disallowedTest.source}${test.post}`
            } as IDraftElement<'client'> );
            const elm = await response.json<IDraftElement<'client'>>();

            assert.equal( response.status, 200 );

            // Essentially we are checking that the disallowed html is stripped, and therefore we should only have
            // the wrapper
            if ( disallowedTest.replacedWith && disallowedTest.replacedWith[ test.type ] )
              assert.equal( elm.html, disallowedTest.replacedWith[ test.type ] );
            else
              assert.equal( elm.html, `${test.pre}${test.post}` );
          } )
        } )
      } )
    } )
  } )
} )