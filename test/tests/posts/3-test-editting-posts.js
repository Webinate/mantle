const test = require( 'unit.js' );
let guest, admin, config, numPosts, postId, secondPostId;

describe( '3. Testing editing of posts', function() {

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

  it( 'did delete any existing posts with the slug --edit--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--edit--test--` );
    const json = await resp.json();

    if ( json.data )
      await admin.delete( `/api/posts/${json.data._id}` );
  } )

  it( 'did delete any existing posts with the slug --second--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--second--test--` );
    const json = await resp.json();

    if ( json.data )
      await admin.delete( `/api/posts/${json.data._id}` );
  } )

  it( 'did create a post to test editting post data', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--edit--test--",
      public: true,
      content: "Hello world"
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    postId = json.data._id;
  } )

  it( 'did create a second post to test editting post data', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--second--test--",
      public: true,
      content: "Hello world"
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    secondPostId = json.data._id;
  } )

  it( 'cannot edit a post with an invalid ID', async function() {
    const resp = await admin.put( `/api/posts/woohoo`, { title: "Simple Test 3" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot edit a post with an valid ID but doesnt exist', async function() {
    const resp = await admin.put( `/api/posts/123456789012345678901234`, { title: "Simple Test 3" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Could not find post with that id" );
  } )

  it( 'cannot edit a post without permission', async function() {
    const resp = await guest.put( `/api/posts/${postId}`, { title: "Simple Test 3" } );
    test.number( resp.status ).is( 401 );
    const json = await resp.json();
    test.string( json.message ).is( "You must be logged in to make this request" );
  } )

  it( 'cannot change an existing post with a slug already in use', async function() {
    const resp = await admin.put( `/api/posts/${secondPostId}`, { slug: "--edit--test--" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "'slug' must be unique" );
  } )

  it( 'can change a post slug with a slug already in use, if its the same post', async function() {
    const resp = await admin.put( `/api/posts/${postId}`, { slug: "--edit--test--" } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( postId );
    test.string( json.slug ).is( '--edit--test--' );
    test.string( json.title ).is( 'Simple Test' );
  } )

  it( 'can edit a post with valid details', async function() {
    const resp = await admin.put( `/api/posts/${postId}`, { content: "Updated" } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( postId );
    test.string( json.content ).is( 'Updated' );
  } )

  it( 'did cleanup the test post', async function() {
    const resp = await admin.delete( `/api/posts/${postId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'did cleanup the second test post', async function() {
    const resp = await admin.delete( `/api/posts/${secondPostId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numPosts ).isTrue();
  } )
} )