const test = require( 'unit.js' );
let guest, admin, config, numPosts, publicPostId, privatePostId;

describe( '4. Testing fetching of posts', function() {

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

  it( 'did delete any existing posts with the slug --public--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--public--test--` );
    const json = await resp.json();
    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did delete any existing posts with the slug --private--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--private--test--` );
    const json = await resp.json();

    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'did create a public post to test fetching public post data', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--public--test--",
      public: true,
      content: "Hello world",
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    publicPostId = json._id;
  } )

  it( 'did create a private post to test fetching private post data', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--private--test--",
      public: false,
      content: "Hello world"
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    privatePostId = json._id;
  } )

  it( 'cannot get a post that doesnt exist', async function() {
    const resp = await admin.get( `/api/posts/slug/--simple--test--2--` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( 'Could not find post' );
  } )

  it( 'can fetch posts and impose a limit off 1 on them', async function() {
    const resp = await admin.get( `/api/posts?limit=1` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'can fetch posts and impose an index and limit', async function() {
    const resp = await admin.get( `/api/posts?index=${numPosts ? numPosts - 1 : 0}&limit=1` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'fetched 1 post with category specified', async function() {
    const resp = await admin.get( `/api/posts?categories=super-tests` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'fetched 1 post with tag specified', async function() {
    const resp = await admin.get( `/api/posts?tags=super-tags-1234` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'fetched 1 post with 2 tags specified', async function() {
    const resp = await admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'fetched 1 post with 2 known tags specified & 1 unknown', async function() {
    const resp = await admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321,dinos` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'fetched 1 post with 1 known tag & 1 category', async function() {
    const resp = await admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'fetched 0 posts with 1 known tag & 1 unknown category', async function() {
    const resp = await admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests-wrong` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 0 );
  } )

  it( 'fetched 1 posts when not logged in as admin and post is not public', async function() {
    const resp = await guest.get( `/api/posts?tags=super-tags-1234&categories=super-tests`, null );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 1 );
  } )

  it( 'Should not fetch with a tag that is not associated with any posts', async function() {
    const resp = await admin.get( `/api/posts?tags=nononononononoonononono` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.count ).is( 0 );
  } )

  it( 'cannot fetch single post by invalid slug', async function() {
    const resp = await admin.get( `/api/posts/slug/WRONGWRONGWRONG` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "Could not find post" );
  } )

  it( 'can fetch single post by slug', async function() {
    const resp = await admin.get( `/api/posts/slug/--public--test--` );
  } )

  it( 'cannot fetch a private post by slug when not logged in', async function() {
    const resp = await guest.get( `/api/posts/slug/--private--test--` );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "That post is marked private" );

  } )

  it( 'can fetch a public post by slug when not logged in', async function() {
    const resp = await guest.get( `/api/posts/slug/--public--test--` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "_id" )
  } )

  it( 'did cleanup the test public post', async function() {
    const resp = await admin.delete( `/api/posts/${publicPostId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'did cleanup the test private post', async function() {
    const resp = await admin.delete( `/api/posts/${privatePostId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( json.count === numPosts ).isTrue();
  } )
} )