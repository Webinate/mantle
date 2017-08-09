const test = require( 'unit.js' );
let guest, admin, config, numPosts,
    numComments, postId, commentId;

describe( 'Testing creation of comments', function() {

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
                            test.bool( res.body.error ).isFalse();
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
                test.bool( res.body.error ).isNotTrue();
                test.number( res.body.count );
                numPosts = res.body.count;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'fetched all comments', function( done ) {
        admin.get( `/api/comments` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
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

    it( 'cannot create a comment when not logged in', function( done ) {
        guest
            .code( 500 )
            .post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` )
            .then( res => {
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a comment with a badly formatted post id', function( done ) {
        admin
            .code( 500 )
            .post( `/api/posts/bad/comments/bad` )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a comment with a badly formatted parent comment id', function( done ) {
        admin
            .code( 500 )
            .post( `/api/posts/123456789012345678901234/comments/bad` )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a comment without a post that actually exists', function( done ) {
        admin
            .code( 500 )
            .post( `/api/posts/123456789012345678901234/comments` )
            .then( res => {
                test.string( res.body.message ).is( "post does not exist" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a comment without a post that actually exists', function( done ) {
        admin
            .code( 500 )
            .post( `/api/posts/123456789012345678901234/comments/123456789012345678901234` )
            .then( res => {
                test.string( res.body.message ).is( "No comment exists with the id 123456789012345678901234" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a comment on a post that does exist with illegal html', function( done ) {
        admin
            .code( 500 )
            .post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__ <script type='text/javascript'>alert(\"BOOO\")</script>" } )
            .then( res => {
                test.string( res.body.message ).is( "'content' has html code that is not allowed" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can create a comment on a valid post', function( done ) {
        admin.post( `/api/posts/${postId}/comments`, { content: "Hello world! __filter__", public: false } )
            .then( res => {
                commentId = res.body.data._id;
                test.string( res.body.message ).is( "New comment created" );
                test.string( res.body.data._id );
                test.string( res.body.data.author );
                test.value( res.body.data.parent ).isNull();
                test.string( res.body.data.post ).is( postId );
                test.string( res.body.data.content ).is( "Hello world! __filter__" );
                test.array( res.body.data.children ).hasLength( 0 );
                test.bool( res.body.data.public ).isFalse();
                test.number( res.body.data.createdOn );
                test.number( res.body.data.lastUpdated );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can create a another comment on the same post, with a parent comment', function( done ) {
        admin.post( `/api/posts/${postId}/comments/${commentId}`, { content: "Hello world 2", public: true } )
            .then( res => {
                test.string( res.body.message ).is( "New comment created" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did delete the test post', function( done ) {
        admin.delete( `/api/posts/${postId}` )
            .then( res => {
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'has cleaned up the posts successfully', function( done ) {
        admin.get( `/api/posts` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                test.bool( res.body.count === numPosts ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should have the same number of comments as before the tests started', function( done ) {
        admin.get( `/api/comments` )
            .then( res => {
                test.number( res.body.count );
                test.bool( numComments === res.body.count ).isTrue();
                test.bool( res.body.error ).isNotTrue()
                done();
            } ).catch( err => done( err ) );
    } )
} )