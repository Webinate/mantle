const test = require( 'unit.js' );
let guest, admin, config, numPosts, postId;

describe( 'Testing deletion of posts', function() {

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

    it( 'did create a post to test deletion', function( done ) {
        admin.post( `/api/posts`, {
            title: "Simple Test",
            slug: "--simple--test--",
            public: true,
            content: "Hello world"
        } ).then( res => {
            postId = res.body.data._id;
            done();
        } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a post with invalid ID format', function( done ) {
        admin
            .code( 500 )
            .delete( `/api/posts/WRONGWRONGWRONG` )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a post with invalid ID', function( done ) {
        admin
            .code( 500 )
            .delete( `/api/posts/123456789012345678901234` )
            .then( res => {
                test.string( res.body.message ).is( "Could not find a post with that ID" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a post without permission', function( done ) {
        guest
            .code( 500 )
            .delete( `/api/posts/${postId}`, null )
            .then( res => {
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can delete a post with valid ID & admin permissions', function( done ) {
        admin.delete( `/api/posts/${postId}` )
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