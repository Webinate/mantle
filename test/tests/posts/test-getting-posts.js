const test = require( 'unit.js' );
let guest, admin, config, numPosts, publicPostId, privatePostId;

describe( 'Testing fetching of posts', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'fetched all posts', function( done ) {
    admin.get( `/api/posts` )
      .then( res => {
        test.number( res.body.count );
        numPosts = res.body.count;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did delete any existing posts with the slug --public--test--', function( done ) {
    admin
      .code( null )
      .get( `/api/posts/slug/--public--test--` )
      .then( res => {
        if ( res.body.data ) {
          admin.delete( `/api/posts/${res.body.data._id}` )
            .then( res => {
              done();
            } ).catch( err => done( err ) );
        }
        else
          done();
      } ).catch( err => done( err ) );
  } )

  it( 'did delete any existing posts with the slug --private--test--', function( done ) {
    admin
      .code( null )
      .get( `/api/posts/slug/--private--test--` )
      .then( res => {
        if ( res.body.data ) {
          admin.delete( `/api/posts/${res.body.data._id}` )
            .then( res => {
              done();
            } ).catch( err => done( err ) );
        }
        else
          done();
      } ).catch( err => done( err ) );
  } )

  it( 'did create a public post to test fetching public post data', function( done ) {
    admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--public--test--",
      public: true,
      content: "Hello world",
      categories: [ "super-tests" ],
      tags: [ "super-tags-1234", "supert-tags-4321" ]
    } ).then( res => {
      publicPostId = res.body.data._id;
      done();
    } ).catch( err => done( err ) );
  } )

  it( 'did create a private post to test fetching private post data', function( done ) {
    admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--private--test--",
      public: false,
      content: "Hello world"
    } ).then( res => {
      privatePostId = res.body.data._id;
      done();
    } ).catch( err => done( err ) );
  } )

  it( 'cannot get a post that doesnt exist', function( done ) {
    admin
      .code( 500 )
      .get( `/api/posts/slug/--simple--test--2--` )
      .then( res => {
        test.string( res.body.message ).is( 'Could not find post' );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can fetch posts and impose a limit off 1 on them', function( done ) {
    admin.get( `/api/posts?limit=1` )
      .then( res => {
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can fetch posts and impose an index and limit', function( done ) {
    admin.get( `/api/posts?index=${numPosts ? numPosts - 1 : 0}&limit=1` )
      .then( res => {
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 post with category specified', function( done ) {
    admin.get( `/api/posts?categories=super-tests` )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 post with tag specified', function( done ) {
    admin.get( `/api/posts?tags=super-tags-1234` )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 post with 2 tags specified', function( done ) {
    admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321` )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 post with 2 known tags specified & 1 unknown', function( done ) {
    admin.get( `/api/posts?tags=super-tags-1234,supert-tags-4321,dinos` )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 post with 1 known tag & 1 category', function( done ) {
    admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests` )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 0 posts with 1 known tag & 1 unknown category', function( done ) {
    admin.get( `/api/posts?tags=super-tags-1234&categories=super-tests-wrong` )
      .then( res => {
        test.number( res.body.count ).is( 0 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched 1 posts when not logged in as admin and post is not public', function( done ) {
    guest.get( `/api/posts?tags=super-tags-1234&categories=super-tests`, null )
      .then( res => {
        test.number( res.body.count ).is( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'Should not fetch with a tag that is not associated with any posts', function( done ) {
    admin.get( `/api/posts?tags=nononononononoonononono` )
      .then( res => {
        test.number( res.body.count ).is( 0 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot fetch single post by invalid slug', function( done ) {
    admin
      .code( 500 )
      .get( `/api/posts/slug/WRONGWRONGWRONG` )
      .then( res => {
        test.string( res.body.message ).is( "Could not find post" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can fetch single post by slug', function( done ) {
    admin.get( `/api/posts/slug/--public--test--` )
      .then( res => {
        test.string( res.body.message ).is( "Found 1 posts" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot fetch a private post by slug when not logged in', function( done ) {
    guest
      .code( 500 )
      .get( `/api/posts/slug/--private--test--` )
      .then( res => {
        test.string( res.body.message ).is( "That post is marked private" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can fetch a public post by slug when not logged in', function( done ) {
    guest.get( `/api/posts/slug/--public--test--` )
      .then( res => {
        test.string( res.body.message ).is( "Found 1 posts" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did cleanup the test public post', function( done ) {
    admin.delete( `/api/posts/${publicPostId}` )
      .then( res => {
        test.string( res.body.message ).is( "Post has been successfully removed" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did cleanup the test private post', function( done ) {
    admin.delete( `/api/posts/${privatePostId}` )
      .then( res => {
        test.string( res.body.message ).is( "Post has been successfully removed" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'has cleaned up the posts successfully', function( done ) {
    admin.get( `/api/posts` )
      .then( res => {
        test.bool( res.body.count === numPosts ).isTrue();
        done();
      } ).catch( err => done( err ) );
  } )
} )