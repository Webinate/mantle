const test = require( 'unit.js' );
let guest, admin, config, numPosts,
  numComments, postId, publicCommentId,
  privateCommentId, parentCommentId, childCommentId;

describe( '3. Testing fetching of comments', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'did delete any existing posts with the slug --comments--test--', function( done ) {
    admin
      .code( null )
      .get( `/api/posts/slug/--comments--test--` )
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

  it( 'fetched all posts', function( done ) {
    admin.get( `/api/posts` )
      .then( res => {
        test.number( res.body.count );
        numPosts = res.body.count;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'fetched all comments', function( done ) {
    admin.get( `/api/comments` )
      .then( res => {
        test.number( res.body.count );
        numComments = res.body.count;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can create a temp post', function( done ) {
    admin.post( `/api/posts`, {
      title: "Simple Test",
      slug: "--comments--test--",
      brief: "This is brief",
      public: false,
      content: "Hello world"
    } ).then( res => {
      postId = res.body.data._id;
      test.bool( res.body.data.public ).isFalse();
      done();
    } ).catch( err => done( err ) );
  } )

  it( 'did create a test public comment', function( done ) {
    admin.post( `/api/posts/${postId}/comments`, { content: "Hello world public! __filter__", public: true } )
      .then( res => {
        publicCommentId = res.body.data._id;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did create a test private comment', function( done ) {
    admin.post( `/api/posts/${postId}/comments`, { content: "Hello world private! __filter__", public: false } )
      .then( res => {
        privateCommentId = res.body.data._id;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can create a another comment which will be a parent comment', function( done ) {
    admin.post( `/api/posts/${postId}/comments`, { content: "Parent Comment", public: true } )
      .then( res => {
        parentCommentId = res.body.data._id;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can create a nested comment', function( done ) {
    admin.post( `/api/posts/${postId}/comments/${parentCommentId}`, { content: "Child Comment", public: true } )
      .then( res => {
        childCommentId = res.body.data._id;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot get a comment with an invalid id', function( done ) {
    admin
      .code( 500 )
      .get( `/api/comments/BADID` )
      .then( res => {
        test.string( res.body.message ).is( "Invalid ID format" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot get a comment that does not exist', function( done ) {
    admin
      .code( 500 )
      .get( `/api/comments/123456789012345678901234` )
      .then( res => {
        test.string( res.body.message ).is( "Could not find comment" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get a valid comment by ID', function( done ) {
    admin.get( `/api/comments/${publicCommentId}` )
      .then( res => {
        test.string( res.body.data._id ).is( publicCommentId );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'cannot get a private comment without being logged in', function( done ) {
    guest
      .code( 500 )
      .get( `/api/comments/${privateCommentId}` )
      .then( res => {
        test.string( res.body.message ).is( "That comment is marked private" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get a public comment without being logged in', function( done ) {
    guest.get( `/api/comments/${publicCommentId}` )
      .then( res => {
        test.string( res.body.data._id ).is( publicCommentId );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get comments by user & there are more than 1', function( done ) {
    admin.get( `/api/users/${admin.username}/comments` )
      .then( res => {
        test.number( res.body.count );
        test.bool( res.body.count >= 2 ).isTrue();
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get comments by user & there should be 2 if we filter by keyword', function( done ) {
    admin.get( `/api/users/${admin.username}/comments?keyword=__filter__` )
      .then( res => {
        test.number( res.body.count );
        test.array( res.body.data ).hasLength( 2 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get comments by user & should limit whats returned to 1', function( done ) {
    admin.get( `/api/users/${admin.username}/comments?keyword=__filter__&limit=1` )
      .then( res => {
        test.number( res.body.count );
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get comments by user & should limit whats returned to 1 if not admin', function( done ) {
    guest.get( `/api/users/${admin.username}/comments?keyword=__filter__` )
      .then( res => {
        test.number( res.body.count );
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get the parent comment and has previously created comment as child', function( done ) {
    admin.get( `/api/comments/${parentCommentId}` )
      .then( res => {
        test.string( res.body.data._id ).is( parentCommentId );
        test.array( res.body.data.children ).contains( [ childCommentId ] );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get a comment with parent & post, and both properties are just ids (not expanded)', function( done ) {
    admin.get( `/api/comments/${childCommentId}` )
      .then( res => {
        test.string( res.body.data._id ).is( childCommentId );
        test.string( res.body.data.parent ).is( parentCommentId );
        test.string( res.body.data.post ).is( postId );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'can get a comment with parent & post, and both properties are the respective objects (expanded)', function( done ) {
    admin.get( `/api/comments/${childCommentId}?expanded=true` )
      .then( res => {
        test.string( res.body.data._id ).is( childCommentId );
        test.string( res.body.data.parent ).is( parentCommentId );
        test.string( res.body.data.post._id ).is( postId );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did delete the test post', function( done ) {
    admin.delete( `/api/posts/${postId}` )
      .then( res => {
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

  it( 'should have the same number of comments as before the tests started', function( done ) {
    admin.get( `/api/comments` )
      .then( res => {
        test.number( res.body.count );
        test.bool( numComments === res.body.count ).isTrue();
        done();
      } ).catch( err => done( err ) );
  } )
} )