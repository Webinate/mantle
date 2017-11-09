const test = require( 'unit.js' );
let guest, admin, config, numPosts, lastPost, lastPost2;

describe( '1. Testing creation of posts', function() {

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

  it( 'cannot create post when not logged in', async function() {
    const resp = await guest.post( `/api/posts`, { name: "" } );
    test.number( resp.status ).is( 401 );
    const json = await resp.json();
    test.string( json.message ).is( "You must be logged in to make this request" );
  } )

  it( 'cannot create a post without title', async function() {
    const resp = await admin.post( `/api/posts`, { title: "", slug: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "title cannot be empty" );
  } )

  it( 'cannot create a post without a slug field', async function() {
    const resp = await admin.post( `/api/posts`, { title: "test" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "slug is required" );
  } )

  it( 'cannot create a post without slug', async function() {
    const resp = await admin.post( `/api/posts`, { title: "test", slug: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.string( json.message ).is( "slug cannot be empty" );
  } )

  it( 'did delete any existing posts with the slug --simple--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--simple--test--` );
    const json = await resp.json();

    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'can create a post with valid data', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--simple--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world",
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();

    lastPost = json._id;
    test.bool( json.public ).isFalse();
    test.string( json.content ).is( "Hello world" );
    test.string( json.brief ).is( "This is brief" );
    test.string( json.slug ).is( "--simple--test--" );
    test.string( json.title ).is( "Simple Test" );
    test.array( json.categories ).hasLength( 1 );
    test.string( json.categories[ 0 ] ).is( "super-tests" );
    test.array( json.tags ).hasLength( 2 );
    test.string( json.tags[ 0 ] ).is( "super-tags-1234" );
    test.string( json.tags[ 1 ] ).is( "supert-tags-4321" );
    test.string( json._id );
    test.number( json.createdOn ).isGreaterThan( 0 );
    test.number( json.lastUpdated ).isGreaterThan( 0 );
  } )

  it( 'did delete any existing posts with this slug --strip--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--strip--test--` );
    const json = await resp.json();
    if ( json )
      await admin.delete( `/api/posts/${json._id}` );
  } )

  it( 'should create a post & strip HTML from title', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test <h2>NO</h2>",
      slug: "--strip--test--",
      brief: "This is brief"
    } );

    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.title ).is( "Simple Test NO" );
    lastPost2 = json._id;
  } )

  it( 'did delete the first post', async function() {
    const resp = await admin.delete( `/api/posts/${lastPost}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'did delete the second post', async function() {
    const resp = await admin.delete( `/api/posts/${lastPost2}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )
} )