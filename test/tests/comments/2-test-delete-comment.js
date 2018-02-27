const test = require( 'unit.js' );
let guest, admin, config, numPosts, numComments,
  postId, commentId, parentCommentId;

describe( '2. Testing deletion of comments', function() {

  before( function() {
    const header = require( '../header' ).default;
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

  it( 'fetched all comments', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    numComments = json.count;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--comments--test--` );
    const json = await resp.json();
    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
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
    postId = json._id;
    test.bool( json.public ).isFalse();
  } )

  it( 'did create a test comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world!", public: false } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    commentId = json._id;
  } )

  it( 'did incremented the number of comments by 1', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numComments + 1 ).isTrue();
  } )

  it( 'can create a another comment which will be a parent comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Parent Comment", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    parentCommentId = json._id;
  } )

  it( 'did incremented the number of comments by 2', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numComments + 2 ).isTrue();
  } )

  it( 'can create a nested comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments/${parentCommentId}`, { content: "Child Comment", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )

  it( 'did incremented the number of comments by 3', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numComments + 3 ).isTrue();
  } )

  it( 'cannot delete a comment with a bad id', async function() {
    const resp = await admin.delete( `/api/comments/abc`, {} );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot delete a comment with a valid id but doesn\'t exist', async function() {
    const resp = await admin.delete( `/api/comments/123456789012345678901234`, {} );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Could not find comment" );
  } )

  it( 'can delete the parent comment', async function() {
    const resp = await admin.delete( `/api/comments/${parentCommentId}`, {} );
    test.number( resp.status ).is( 204 );
  } )

  it( 'should have the 2 less comments as the parent & child were removed', async function() {
    const resp = await admin.get( `/api/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.bool( json.count === numComments + 1 ).isTrue();
  } )

  it( 'can delete a regular existing comment', async function() {
    const resp = await admin.delete( `/api/comments/${commentId}`, {} );
    test.number( resp.status ).is( 204 );
  } )

  it( 'did delete the test post', async function() {
    const resp = await admin.delete( `/api/posts/${postId}` );
    test.number( resp.status ).is( 204 );
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