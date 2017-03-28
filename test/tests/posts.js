var test = require( 'unit.js' );
var header = require( './header.js' );
var lastPost = null;
var tempPost = null;
var numPosts = 0;
const manager = header.TestManager.get;

/**
 * Tests all post related endpoints
 */
describe( 'Testing all post related endpoints', function() {
    it( 'Fetched all posts', function( done ) {
        manager.get( `/api/posts`, null )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                test.number( res.body.count );
                numPosts = res.body.count;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create post when not logged in', function( done ) {
        manager.post( `/api/posts`, { name: "" }, null )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a post without title', function( done ) {
        manager.post( `/api/posts`,  { title: "", slug: "" } )
            .then( res => {
                test.string( res.body.message ).is( "title cannot be empty" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a post without a slug field', function( done ) {
        manager.post( `/api/posts`,  { title: "test" } )
            .then( res => {
                test.string( res.body.message ).is( "slug is required" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a post without slug', function( done ) {
        manager.post( `/api/posts`,  { title: "test", slug: "" } )
            .then( res => {
                 test.bool( res.body.error ).isTrue();
                test.string( res.body.message ).is( "slug cannot be empty" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'has no posts with the slug --simple--test--', function( done ) {
        manager.get( `/api/posts/slug/--simple--test--` )
            .then( res => {
                if ( res.body.data && res.body.data._id )
                    manager.delete( `/api/posts/${res.body.data._id}`, {} )
                        .then( function( res ) {
                            done();
                        }).catch( (err)=> done(err) );
                else
                    done();
            } ).catch( err => done( err ) );
    } )

    it( 'has no posts with the slug --to--delete--', function( done ) {
        manager.get( `/api/posts/slug/--to--delete--` )
            .then( res => {
                if ( res.body.data && res.body.data._id ) {
                    manager.delete( `/api/posts/${res.body.data._id}`, {} )
                        .then( function( res ) {
                            done();
                        }).catch( (err)=> done(err) );
                }
                else
                    done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a post with data', function( done ) {
        manager.post( `/api/posts`, {
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

    it( 'Can fetch posts and impose a limit off 1 on them', function( done ) {
        manager.get( `/api/posts?limit=1` )
            .then( res => {
                test.array( res.body.data ).hasLength( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can fetch posts and impose an index and limit', function( done ) {
        manager.get( `/api/posts?index=${numPosts - 1}&limit=1` )
            .then( res => {
                test.array( res.body.data ).hasLength( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 1 post with category specified', function( done ) {
        manager.get( `/api/posts?categories=super-tests` )
            .then( res => {
                test.number( res.body.count ).is( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 1 post with tag specified', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234` )
            .then( res => {
                test.number( res.body.count ).is( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 1 post with 2 tags specified', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234,supert-tags-4321` )
            .then( res => {
                test.number( res.body.count ).is( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 1 post with 2 known tags specified & 1 optional', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234,supert-tags-4321,dinos` )
            .then( res => {
                test.number( res.body.count ).is( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 1 post with 1 known tag & 1 category', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234&categories=super-tests` )
            .then( res => {
                test.number( res.body.count ).is( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 0 posts with 1 known tag & 1 unknown category', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234&categories=super-tests-wrong` )
            .then( res => {
                test.number( res.body.count ).is( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Fetched 0 posts when not logged in as admin as post is not public', function( done ) {
        manager.get( `/api/posts?tags=super-tags-1234&categories=super-tests`, null )
            .then( res => {
                test.number( res.body.count ).is( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Should not fetch with a tag that is not associated with any posts', function( done ) {
        manager.get( `/api/posts?tags=nononononononoonononono` )
            .then( res => {
                test.number( res.body.count ).is( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a post with an existing slug', function( done ) {
        manager.post( `/api/posts`,  { title: "Simple Test 2", slug: "--simple--test--" } )
            .then( res => {
                test.string( res.body.message ).is( "'slug' must be unique" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot edit a post with an invalid ID', function( done ) {
        manager.put( `/api/posts/woohoo`,  { title: "Simple Test 3" } )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot edit a post with an valid ID but doesnt exist', function( done ) {
        manager.put( `/api/posts/123456789012345678901234`,  { title: "Simple Test 3" } )
            .then( res => {
                test.string( res.body.message ).is( "Could not find post with that id" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot edit a post without permission', function( done ) {
        manager.put( `/api/posts/${lastPost}`,  { title: "Simple Test 3" }, null )
            .then( res => {
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Should create a new temp post', function( done ) {
        manager.post( `/api/posts`,  { title: "To Delete", slug: "--to--delete--" } )
            .then( res => {
                test.string( res.body.message ).is( "New post created" );
                tempPost = res.body.data._id
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot edit a post with the same slug', function( done ) {
        manager.put( `/api/posts/${lastPost}`,  { slug: "--to--delete--" } )
            .then( res => {
                test.string( res.body.message ).is( "'slug' must be unique" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can edit a post with valid details', function( done ) {
        manager.put( `/api/posts/${lastPost}`,  { content: "Updated" } )
            .then( res => {
                test.string( res.body.message ).is( "Post Updated" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot fetch single post by invalid slug', function( done ) {
        manager.get( `/api/posts/slug/WRONGWRONGWRONG` )
            .then( res => {
                test.string( res.body.message ).is( "Could not find post" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can fetch single post by slug', function( done ) {
        manager.get( `/api/posts/slug/--simple--test--` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 posts" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot fetch single post by slug when its private and not logged in', function( done ) {
        manager.get( `/api/posts/slug/--simple--test--`, null )
            .then( res => {
                test.string( res.body.message ).is( "That post is marked private" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can set a post to public', function( done ) {
        manager.put( `/api/posts/${lastPost}`, { public: true } )
            .then( res => {
                test.string( res.body.message ).is( "Post Updated" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can fetch single post by slug when its public and not logged in', function( done ) {
        manager.get( `/api/posts/slug/--simple--test--`, null )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 posts" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot delete a post with invalid ID format', function( done ) {
        manager.delete( `/api/posts/WRONGWRONGWRONG`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot delete a post with invalid ID', function( done ) {
        manager.delete( `/api/posts/123456789012345678901234`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Could not find a post with that ID" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot delete a post without permission', function( done ) {
        manager.delete( `/api/posts/${lastPost}`, {}, null )
            .then( res => {
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can delete a post with valid ID', function( done ) {
        manager.delete( `/api/posts/${lastPost}`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Post has been successfully removed" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Should create a post & strip HTML from title', function( done ) {
        manager.post( `/api/posts`, {
                title: "Simple Test <h2>NO</h2>",
                slug: "--simple--test--",
                brief: "This is brief"
            } )
            .then( res => {
                test.string( res.body.message ).is( "New post created" );
                test.string( res.body.data.title ).is( "Simple Test NO" );

                // Clean up
                manager.delete( '/api/posts/' + res.body.data._id, {} ).then( function( res ) {
                    test.string( res.body.message ).is( "Post has been successfully removed" );
                    done();
                } ).catch( err => done( err ) );
            } ).catch( err => done( err ) );
    } )

    it( 'should have the same number of posts as before the tests started', function( done ) {
        manager.get( `/api/posts` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                test.number( res.body.count );
                test.bool( numPosts === res.body.count ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )
} )