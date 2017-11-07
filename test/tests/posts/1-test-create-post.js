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

    if ( json.data )
      await admin.delete( `/api/posts/${json.data._id}` );
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

    lastPost = json.data._id;
    test.string( json.message ).is( "New post created" );
    test.bool( json.data.public ).isFalse();
    test.string( json.data.content ).is( "Hello world" );
    test.string( json.data.brief ).is( "This is brief" );
    test.string( json.data.slug ).is( "--simple--test--" );
    test.string( json.data.title ).is( "Simple Test" );
    test.array( json.data.categories ).hasLength( 1 );
    test.string( json.data.categories[ 0 ] ).is( "super-tests" );
    test.array( json.data.tags ).hasLength( 2 );
    test.string( json.data.tags[ 0 ] ).is( "super-tags-1234" );
    test.string( json.data.tags[ 1 ] ).is( "supert-tags-4321" );
    test.string( json.data._id );
    test.number( json.data.createdOn ).isGreaterThan( 0 );
    test.number( json.data.lastUpdated ).isGreaterThan( 0 );
  } )

  it( 'did delete any existing posts with this slug --strip--test--', async function() {
    const resp = await admin.get( `/api/posts/slug/--strip--test--` );
    const json = await resp.json();
    if ( json.data )
      await admin.delete( `/api/posts/${json.data._id}` );
  } )

  it( 'should create a post & strip HTML from title', async function() {
    const resp = await admin.post( `/api/posts`, {
      title: "Simple Test <h2>NO</h2>",
      slug: "--strip--test--",
      brief: "This is brief"
    } );

    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.message ).is( "New post created" );
    test.string( json.data.title ).is( "Simple Test NO" );
    lastPost2 = json.data._id;
  } )

  it( 'did delete the first post', async function() {
    const resp = await admin.delete( `/api/posts/${lastPost}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )

  it( 'did delete the second post', async function() {
    const resp = await admin.delete( `/api/posts/${lastPost2}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )

  it( 'has cleaned up the posts successfully', async function() {
    const resp = await admin.get( `/api/posts` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
  } )
} )