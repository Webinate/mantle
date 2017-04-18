const test = require( 'unit.js' );
let guest, admin, config, numPosts, numComments, lastPost, commentId, comment2Id;

describe( 'Testing deletion of comments', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        config = header.config;
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

    it( 'did delete any existing posts with the slug --comments--test--', function( done ) {
        admin.get( `/api/posts/slug/--comments--test--` )
            .then( res => {
                if ( res.body.data ) {
                    admin.delete( `/api/posts/${ res.body.data._id }` )
                        .then( res => {
                            test.bool( res.body.error ).isFalse();
                            done();
                        } ).catch( err => done( err ) );
                }
                else
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
            lastPost = res.body.data._id;
            test.bool( res.body.data.public ).isFalse();
            done();
        } ).catch( err => done( err ) );
    } )

    it( 'did create a test comment', function( done ) {
        admin.post( `/api/posts/${ lastPost }/comments`, { content: "Hello world!", public: false } )
            .then( res => {
                commentId = res.body.data._id;
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can create a another comment which will be a parent comment', function( done ) {
        admin.post( `/api/posts/${ lastPost }/comments/${ commentId }`, { content: "Parent Comment", public: true } )
            .then( res => {
                comment2Id = res.body.data._id;
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can create a nested comment', function( done ) {
        admin.post( `/api/posts/${ lastPost }/comments/${ comment2Id }`, { content: "Child Comment", public: true } )
            .then( res => {
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a comment with a bad id', function( done ) {
        admin.delete( `/api/comments/abc`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a comment with a valid id but doesn\'t exist', function( done ) {
        admin.delete( `/api/comments/123456789012345678901234`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Could not find a comment with that ID" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can delete the parent comment', function( done ) {
        admin.delete( `/api/comments/${ comment2Id }`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Comment has been successfully removed" );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should have the 2 less comments as the parent & child were removed', function( done ) {
        admin.get( `/api/comments` )
            .then( res => {
                test.number( res.body.count );
                test.bool( res.body.count - 2 === numComments + 1 ).isTrue();
                test.bool( res.body.error ).isNotTrue()
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can delete a regular existing comment', function( done ) {
        admin.delete( `/api/comments/${ commentId }`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Comment has been successfully removed" );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did delete the test post', function( done ) {
        admin.delete( `/api/posts/${ lastPost }` )
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