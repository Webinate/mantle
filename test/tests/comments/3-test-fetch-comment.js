const test = require( 'unit.js' );
let guest, admin, config, numPosts,
  numComments, postId, publicCommentId,
  privateCommentId, parentCommentId, childCommentId;

describe( '3. Testing fetching of comments', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--comments--test--` );
    const json = await resp.json();
    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
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
    postId = json._id;
    test.bool( json.public ).isFalse();
  } )

  it( 'did create a test public comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world public! __filter__", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    publicCommentId = json._id;
  } )

  it( 'did create a test private comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Hello world private! __filter__", public: false } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    privateCommentId = json._id;
  } )

  it( 'can create a another comment which will be a parent comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments`, { content: "Parent Comment", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    parentCommentId = json._id;
  } )

  it( 'can create a nested comment', async function() {
    const resp = await admin.post( `/api/posts/${postId}/comments/${parentCommentId}`, { content: "Child Comment", public: true } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    childCommentId = json._id;
  } )

  it( 'cannot get a comment with an invalid id', async function() {
    const resp = await admin.get( `/api/comments/BADID` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'cannot get a comment that does not exist', async function() {
    const resp = await admin.get( `/api/comments/123456789012345678901234` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Could not find comment" );
  } )

  it( 'can get a valid comment by ID', async function() {
    const resp = await admin.get( `/api/comments/${publicCommentId}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( publicCommentId );
  } )

  it( 'cannot get a private comment without being logged in', async function() {
    const resp = await guest.get( `/api/comments/${privateCommentId}` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "That comment is marked private" );
  } )

  it( 'can get a public comment without being logged in', async function() {
    const resp = await guest.get( `/api/comments/${publicCommentId}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( publicCommentId );
  } )

  it( 'can get comments by user & there are more than 1', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.bool( json.count >= 2 ).isTrue();
  } )

  it( 'can get comments by user & there should be 2 if we filter by keyword', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments?keyword=__filter__` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.array( json.data ).hasLength( 2 );
  } )

  it( 'can get comments by user & should limit whats returned to 1', async function() {
    const resp = await admin.get( `/api/users/${admin.username}/comments?keyword=__filter__&limit=1` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'can get comments by user & should limit whats returned to 1 if not admin', async function() {
    const resp = await guest.get( `/api/users/${admin.username}/comments?keyword=__filter__` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'can get the parent comment and has previously created comment as child', async function() {
    const resp = await admin.get( `/api/comments/${parentCommentId}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( parentCommentId );
    test.array( json.children ).contains( [ childCommentId ] );
  } )

  it( 'can get a comment with parent & post, and both properties are just ids (not expanded)', async function() {
    const resp = await admin.get( `/api/comments/${childCommentId}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( childCommentId );
    test.string( json.parent ).is( parentCommentId );
    test.string( json.post ).is( postId );
  } )

  it( 'can get a comment with parent & post, and both properties are the respective objects (expanded)', async function() {
    const resp = await admin.get( `/api/comments/${childCommentId}?expanded=true` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json._id ).is( childCommentId );
    test.string( json.parent ).is( parentCommentId );
    test.string( json.post._id ).is( postId );
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