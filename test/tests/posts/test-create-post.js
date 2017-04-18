const test = require( 'unit.js' );
let guest, admin, config, numPosts, lastPost;

describe( 'Testing creation of posts', function() {

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

    it( 'cannot create post when not logged in', function( done ) {
        guest.post( `/api/posts`, { name: "" } )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a post without title', function( done ) {
        admin.post( `/api/posts`, { title: "", slug: "" } )
            .then( res => {
                test.string( res.body.message ).is( "title cannot be empty" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a post without a slug field', function( done ) {
        admin.post( `/api/posts`, { title: "test" } )
            .then( res => {
                test.string( res.body.message ).is( "slug is required" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot create a post without slug', function( done ) {
        admin.post( `/api/posts`, { title: "test", slug: "" } )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.string( res.body.message ).is( "slug cannot be empty" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'can create a post with valid data', function( done ) {
        admin.post( `/api/posts`, {
            title: "Simple Test",
            slug: "--simple--test--",
            brief: "This is brief",
            public: false,
            content: "Hello world",
            categories: [ "super-tests" ],
            tags: [ "super-tags-1234", "supert-tags-4321" ]
        } ).then( res => {
            lastPost = res.body.data._id;
            test.string( res.body.message ).is( "New post created" );
            test.bool( res.body.data.public ).isFalse();
            test.string( res.body.data.content ).is( "Hello world" );
            test.string( res.body.data.brief ).is( "This is brief" );
            test.string( res.body.data.slug ).is( "--simple--test--" );
            test.string( res.body.data.title ).is( "Simple Test" );
            test.array( res.body.data.categories ).hasLength( 1 );
            test.string( res.body.data.categories[ 0 ] ).is( "super-tests" );
            test.array( res.body.data.tags ).hasLength( 2 );
            test.string( res.body.data.tags[ 0 ] ).is( "super-tags-1234" );
            test.string( res.body.data.tags[ 1 ] ).is( "supert-tags-4321" );
            test.string( res.body.data._id );
            test.number( res.body.data.createdOn ).isGreaterThan( 0 );
            test.number( res.body.data.lastUpdated ).isGreaterThan( 0 );
            done();
        } ).catch( err => done( err ) );
    } )

    it( 'did delete the created file', function( done ) {
        manager.delete( `/api/posts/${lastPost}` )
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
} )