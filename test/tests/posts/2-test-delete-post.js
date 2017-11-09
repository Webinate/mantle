const test = require( 'unit.js' );
let guest, admin, config, numPosts, postId;

describe( '2. Testing deletion of posts', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'fetched all posts', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    numPosts = json.count;
  } )

  it( 'did create a post to test deletion', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--simple--test--",
      public: true,
      content: "Hello world"
    } );

    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    postId = json._id;
  } )

  it( 'cannot delete a post with invalid ID format', async function() {
    const resp = await admin.delete( `/api/posts/WRONGWRONGWRONG` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot delete a post with invalid ID', async function() {
    const resp = await admin.delete( `/api/posts/123456789012345678901234` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Could not find a post with that ID" );
  } )

  it( 'cannot delete a post without permission', async function() {
    const resp = await guest.delete( `/api/posts/${postId}`, null );
    test.number( resp.status ).is( 401 );
    const json = await resp.json();
    test.string( json.message ).is( "You must be logged in to make this request" );
  } )

  it( 'can delete a post with valid ID & admin permissions', async function() {
    const resp = await admin.delete( `/api/posts/${postId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numPosts ).isTrue();
  } )
} )