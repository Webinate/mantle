const test = require( 'unit.js' );
let guest, admin, config, numPosts, postId, secondPostId;

describe( '3. Testing editing of posts', function() {

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

  it( 'did delete any existing posts with the slug --edit--test--', function( done ) {
    admin
      .code( null )
      .get( `/api/posts/slug/--edit--test--` )
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

  it( 'did delete any existing posts with the slug --second--test--', function( done ) {
    admin
      .code( null )
      .get( `/api/posts/slug/--second--test--` )
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

  it( 'did create a post to test editting post data', function( done ) {
    admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--edit--test--",
      public: true,
      content: "Hello world"
    } ).then( res => {
      postId = res.body.data._id;
      done();
    } ).catch( err => done( err ) );
  } )

  it( 'did create a second post to test editting post data', function( done ) {
    admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--second--test--",
      public: true,
      content: "Hello world"
    } ).then( res => {
      secondPostId = res.body.data._id;
      done();
    } ).catch( err => done( err ) );
  } )

  it( 'cannot edit a post with an invalid ID', function( done ) {
    admin
      .code( 500 )
      .put( `/api/posts/woohoo`, { title: "Simple Test 3" } )
      .then( res => {
        test.string( res.body.message ).is( "Invalid ID format" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot edit a post with an valid ID but doesnt exist', function( done ) {
    admin
      .code( 500 )
      .put( `/api/posts/123456789012345678901234`, { title: "Simple Test 3" } )
      .then( res => {
        test.string( res.body.message ).is( "Could not find post with that id" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot edit a post without permission', function( done ) {
    guest
      .code( 401 )
      .put( `/api/posts/${postId}`, { title: "Simple Test 3" } )
      .then( res => {
        test.string( res.body.message ).is( "You must be logged in to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot change an existing post with a slug already in use', function( done ) {
    admin
      .code( 500 )
      .put( `/api/posts/${secondPostId}`, { slug: "--edit--test--" } )
      .then( res => {
        test.string( res.body.message ).is( "'slug' must be unique" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can change a post slug with a slug already in use, if its the same post', function( done ) {
    admin.put( `/api/posts/${postId}`, { slug: "--edit--test--" } )
      .then( res => {
        test.string( res.body.message ).is( "Post Updated" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can edit a post with valid details', function( done ) {
    admin.put( `/api/posts/${postId}`, { content: "Updated" } )
      .then( res => {
        test.string( res.body.message ).is( "Post Updated" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did cleanup the test post', function( done ) {
    admin.delete( `/api/posts/${postId}` )
      .then( res => {
        test.string( res.body.message ).is( "Post has been successfully removed" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did cleanup the second test post', function( done ) {
    admin.delete( `/api/posts/${secondPostId}` )
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