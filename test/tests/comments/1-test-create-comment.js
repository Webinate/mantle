const test = require( 'unit.js' );
let guest, admin, config, numPosts,
  numComments, postId, commentId;

describe( '1. Testing creation of comments', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', async function() {
    resp = await admin.get( `/api/posts/slug/--comments--test--` );

    if ( json.data )
      resp = await admin.delete( `/api/posts/${json.data._id}` );

  } )

  it( 'fetched all posts', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    numPosts = json.count;
  } )

  it( 'fetched all comments', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    numComments = json.count;
  } )

  it( 'can create a temp post', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--comments--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world"
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    postId = json.data._id;
    test.bool( json.data.public ).isFalse();
  } )

  it( 'cannot create a comment when not logged in', async function() {
    const resp = await guest.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "You must be logged in to make this request" );
  } )

  it( 'cannot create a comment with a badly formatted post id', async function() {
    const resp = await admin.post( `/api/posts/bad/comments/bad` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot create a comment with a badly formatted parent comment id', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments/bad` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot create a comment without a post that actually exists', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "post does not exist" );
  } )

  it( 'cannot create a comment without a post that actually exists', async function() {
    const resp = await admin.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "No comment exists with the id 123456789012345678901234" );
  } )

  it( 'cannot create a comment on a post that does exist with illegal html', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__ <script type='text/javascript'>alert(\"BOOO\")</script>" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "'content' has html code that is not allowed" );
  } )

  it( 'can create a comment on a valid post', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__", public: false } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    commentId = json.data._id;
    test.string( json.data._id );
    test.string( json.data.author );
    test.value( json.data.parent ).isNull();
    test.string( json.data.post ).is( postId );
    test.string( json.data.content ).is( "Hello world! __filter__" );
    test.array( json.data.children ).hasLength( 0 );
    test.bool( json.data.public ).isFalse();
    test.number( json.data.createdOn );
    test.number( json.data.lastUpdated );
  } )

  it( 'can create a another comment on the same post, with a parent comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments/${commentId}`, { content: "Hello world 2", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json.data ).hasProperty( "_id" )
  } )

  it( 'did delete the test post', async function() {
    const resp = await admin.delete( `/api/posts/${postId}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numPosts ).isTrue();
  } )

  it( 'should have the same number of comments as before the tests started', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.bool( numComments === json.count ).isTrue();
  } )
} )