const test = require( 'unit.js' );
let guest, admin, config, numPosts, lastPost;

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
                test.bool( res.body.error ).isNotTrue();
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
            lastPost = res.body.data._id;
            test.bool( res.body.error ).isNotTrue();
            done();
        } ).catch( err => done( err ) );
    } )

    it( 'cannot get a post that doesnt exist', function( done ) {
        admin.get( `/api/posts/slug/--simple--test--2--` )
            .then( res => {
                test.array( res.body.data ).hasLength( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

   
   
   






    it( 'did cleanup the test post', function( done ) {
        admin.delete( `/api/posts/${lastPost}` )
            .then( res => {
                test.string( res.body.message ).is( "Post has been successfully removed" );
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
} )