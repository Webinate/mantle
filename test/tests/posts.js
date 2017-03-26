var test = require( 'unit.js' );
var header = require( './header.js' );
var lastPost = null;
var tempPost = null;
var numPosts = 0;

/**
 * Tests all post related endpoints
 */
describe( 'Testing all post related endpoints', function() {
    it( 'Fetched all posts', function( done ) {
        header.modepressAgent
            .get( '/api/posts' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test.bool( res.body.error ).isNotTrue()
                    .number( res.body.count );

                numPosts = res.body.count;
                done();
            } );
    } )

    it( 'Cannot create post when not logged in', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .send( { name: "" } )
            .end( function( err, res ) {
                test.bool( res.body.error ).isTrue()
                    .string( res.body.message ).is( "You must be logged in to make this request" )

                done();
            } );
    } )

    it( 'Cannot create a post without title', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( { title: "", slug: "" } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "title cannot be empty" )
                    .bool( res.body.error ).isTrue()
                done();
            } );
    } )

    it( 'Cannot create a post without a slug field', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( { title: "test" } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "slug is required" )
                    .bool( res.body.error ).isTrue()
                done();
            } );
    } )

    it( 'Cannot create a post without slug', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( { title: "test", slug: "" } )
            .end( function( err, res ) {
                test
                    .bool( res.body.error ).isTrue()
                    .string( res.body.message ).is( "slug cannot be empty" )

                done();
            } );
    } )

    it( 'has no posts with the slug --simple--test--', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/--simple--test--' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {

                if ( res.body.data && res.body.data._id )
                    header.modepressAgent
                        .delete( '/api/posts/' + res.body.data._id ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                        .set( 'Cookie', header.adminCookie )
                        .end( function( err, res ) {
                            done();
                        } );
                else
                    done();
            } );
    } )

    it( 'has no posts with the slug --to--delete--', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/--to--delete--' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {

                if ( res.body.data && res.body.data._id )
                    header.modepressAgent
                        .delete( '/api/posts/' + res.body.data._id ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                        .set( 'Cookie', header.adminCookie )
                        .end( function( err, res ) {
                            done();
                        } );
                else
                    done();
            } );
    } )

    it( 'Can create a post with data', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "Simple Test",
                slug: "--simple--test--",
                brief: "This is brief",
                public: false,
                content: "Hello world",
                categories: [ "super-tests" ],
                tags: [ "super-tags-1234", "supert-tags-4321" ]
            } )
            .end( function( err, res ) {

                lastPost = res.body.data._id;

                test
                    .string( res.body.message ).is( "New post created" )
                    .bool( res.body.data.public ).isFalse()
                    .string( res.body.data.content ).is( "Hello world" )
                    .string( res.body.data.brief ).is( "This is brief" )
                    .string( res.body.data.slug ).is( "--simple--test--" )
                    .string( res.body.data.title ).is( "Simple Test" )
                    .array( res.body.data.categories ).hasLength( 1 )
                    .string( res.body.data.categories[ 0 ] ).is( "super-tests" )
                    .array( res.body.data.tags ).hasLength( 2 )
                    .string( res.body.data.tags[ 0 ] ).is( "super-tags-1234" )
                    .string( res.body.data.tags[ 1 ] ).is( "supert-tags-4321" )
                    .string( res.body.data._id )
                    .number( res.body.data.createdOn ).isGreaterThan( 0 )
                    .number( res.body.data.lastUpdated ).isGreaterThan( 0 )

                done();
            } );
    } )

    it( 'Can fetch posts and impose a limit off 1 on them', function( done ) {
        header.modepressAgent
            .get( '/api/posts?limit=1' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.array( res.body.data ).hasLength( 1 );
                done();
            } );
    } )

    it( 'Can fetch posts and impose a limit off 0 on them', function( done ) {
        header.modepressAgent
            .get( '/api/posts?index=1&limit=1' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.array( res.body.data ).hasLength( 1 );
                done();
            } );
    } )

    it( 'Fetched 1 post with category specified', function( done ) {
        header.modepressAgent
            .get( '/api/posts?categories=super-tests' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 1 );
                done();
            } );
    } )

    it( 'Fetched 1 post with tag specified', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 1 );
                done();
            } );
    } )

    it( 'Fetched 1 post with 2 tags specified', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234,supert-tags-4321' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 1 );
                done();
            } );
    } )

    it( 'Fetched 1 post with 2 known tags specified & 1 optional', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234,supert-tags-4321,dinos' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 1 );
                done();
            } );
    } )

    it( 'Fetched 1 post with 1 known tag & 1 category', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234&categories=super-tests' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 1 );
                done();
            } );
    } )

    it( 'Fetched 0 posts with 1 known tag & 1 unknown category', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234&categories=super-tests-wrong' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 0 );
                done();
            } );
    } )

    it( 'Fetched 0 posts when not logged in as admin as post is not public', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=super-tags-1234&categories=super-tests' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 0 );
                done();
            } );
    } )

    it( 'Should not fetch with a tag that is not associated with any posts', function( done ) {
        header.modepressAgent
            .get( '/api/posts?tags=nononononononoonononono' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test.number( res.body.count ).is( 0 );
                done();
            } );
    } )

    it( 'Cannot create a post with the same slug', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "Simple Test 2",
                slug: "--simple--test--"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "'slug' must be unique" )

                done();
            } );
    } )

    it( 'Cannot edit a post with an invalid ID', function( done ) {
        header.modepressAgent
            .put( '/api/posts/woohoo' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "Simple Test 3"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Invalid ID format" )

                done();
            } );
    } )

    it( 'Cannot edit a post with an valid ID but doesnt exist', function( done ) {
        header.modepressAgent
            .put( '/api/posts/123456789012345678901234' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "Simple Test 3"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Could not find post with that id" )

                done();
            } );
    } )

    it( 'Cannot edit a post without permission', function( done ) {
        header.modepressAgent
            .put( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .send( {
                title: "Simple Test 3"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "You must be logged in to make this request" )

                done();
            } );
    } )

    it( 'Should create a new temp post', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "To Delete",
                slug: "--to--delete--"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "New post created" )

                tempPost = res.body.data._id
                done();
            } );
    } )

    it( 'Cannot edit a post with the same slug', function( done ) {
        header.modepressAgent
            .put( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                slug: "--to--delete--"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "'slug' must be unique" )

                done();
            } );
    } )

    it( 'Can edit a post with valid details', function( done ) {
        header.modepressAgent
            .put( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                content: "Updated"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Post Updated" )

                done();
            } );
    } )

    it( 'Cannot fetch single post by invalid slug', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/WRONGWRONGWRONG' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Could not find post" )

                done();
            } );
    } )

    it( 'Can fetch single post by slug', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/--simple--test--' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Found 1 posts" )

                done();
            } );
    } )

    it( 'Cannot fetch single post by slug when its private and not logged in', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/--simple--test--' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "That post is marked private" )

                done();
            } );
    } )

    it( 'Can set a post to public', function( done ) {
        header.modepressAgent
            .put( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                public: true
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Post Updated" )

                done();
            } );
    } )

    it( 'Can fetch single post by slug when its public and not logged in', function( done ) {
        header.modepressAgent
            .get( '/api/posts/slug/--simple--test--' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Found 1 posts" )

                done();
            } );
    } )

    it( 'Cannot delete a post with invalid ID format', function( done ) {
        header.modepressAgent
            .delete( '/api/posts/WRONGWRONGWRONG' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Invalid ID format" )

                done();
            } );
    } )

    it( 'Cannot delete a post with invalid ID', function( done ) {
        header.modepressAgent
            .delete( '/api/posts/123456789012345678901234' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Could not find a post with that ID" )

                done();
            } );
    } )

    it( 'Cannot delete a post without permission', function( done ) {
        header.modepressAgent
            .delete( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "You must be logged in to make this request" )

                done();
            } );
    } )

    it( 'Can delete a post with valid ID', function( done ) {
        header.modepressAgent
            .delete( '/api/posts/' + lastPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Post has been successfully removed" )

                done();
            } );
    } )

    it( 'Can delete temp post with valid ID', function( done ) {
        header.modepressAgent
            .delete( '/api/posts/' + tempPost ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "Post has been successfully removed" )

                done();
            } );
    } )

    it( 'Should create a post & strip HTML from title', function( done ) {
        header.modepressAgent
            .post( '/api/posts' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .set( 'Cookie', header.adminCookie )
            .send( {
                title: "Simple Test <h2>NO</h2>",
                slug: "--simple--test--",
                brief: "This is brief"
            } )
            .end( function( err, res ) {
                test
                    .string( res.body.message ).is( "New post created" )
                    .string( res.body.data.title ).is( "Simple Test NO" )

                // Clean up
                header.modepressAgent
                    .delete( '/api/posts/' + res.body.data._id ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                    .set( 'Cookie', header.adminCookie )
                    .end( function( err, res ) {
                        test.string( res.body.message ).is( "Post has been successfully removed" )
                        done();
                    } );
            } );
    } )

    it( 'should have the same number of posts as before the tests started', function( done ) {
        header.modepressAgent
            .get( '/api/posts' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .end( function( err, res ) {
                test.bool( res.body.error ).isNotTrue()
                    .number( res.body.count )

                    .bool( numPosts === res.body.count ).isTrue()
                done();
            } );
    } )
} )