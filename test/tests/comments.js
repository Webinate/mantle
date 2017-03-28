var test = require( 'unit.js' );
var header = require( './header.js' );
var numComments = 0;
var lastPost = null;
var comment = null;
var comment2 = null;
const manager = header.TestManager.get;

/**
 * Tests all comment related endpoints
 */
describe( 'Testing all comment related endpoints', function() {

    this.timeout( 20000 );

    it( 'Fetched all comments', function( done ) {
        manager.get( `/api/comments` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                test.number( res.body.count );
                numComments = res.body.count;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment when not logged in', function( done ) {
        manager.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234`, {}, null )
            .then( res => {
                test.string( res.body.message ).is( "You must be logged in to make this request" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment with a badly formatted post id', function( done ) {
        manager.post( `/api/posts/bad/comments/bad`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment with a badly formatted parent comment id', function( done ) {
        manager.post( `/api/posts/123456789012345678901234/comments/bad`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment without a post that actually exists', function( done ) {
        manager.post( `/api/posts/123456789012345678901234/comments`, {} )
            .then( res => {
                test.string( res.body.message ).is( "post does not exist" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment without a post that actually exists', function( done ) {
        manager.post( `/api/posts/123456789012345678901234/comments/123456789012345678901234`, {} )
            .then( res => {
                test.string( res.body.message ).is( "No comment exists with the id 123456789012345678901234" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a temp post', function( done ) {
        manager.post( `/api/posts`, {
                title: "Simple Test",
                slug: "--simple-" + Date.now(),
                content: "Hello world __filter__"
            } )
            .then( res => {
                test.string( res.body.data._id );
                lastPost = res.body.data;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot create a comment on a post that does exist with illegal html', function( done ) {
        manager.post( `/api/posts/${lastPost._id}/comments`, { content: "Hello world! __filter__ <script type='text/javascript'>alert(\"BOOO\")</script>" } )
            .then( res => {
                test.string( res.body.message ).is( "'content' has html code that is not allowed" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a comment on a valid post', function( done ) {
        manager.post( `/api/posts/${lastPost._id}/comments`,  { content: "Hello world! __filter__", public: false } )
            .then( res => {
                comment = res.body.data;
                test.string( res.body.message ).is( "New comment created" );
                test.string( res.body.data._id );
                test.string( res.body.data.author );
                test.value( res.body.data.parent ).isNull();
                test.string( res.body.data.post ).is( lastPost._id );
                test.string( res.body.data.content ).is( "Hello world! __filter__" );
                test.array( res.body.data.children ).hasLength( 0 );
                test.bool( res.body.data.public ).isFalse();
                test.number( res.body.data.createdOn );
                test.number( res.body.data.lastUpdated );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot get a comment with an invalid id', function( done ) {
        manager.get( `/api/comments/BADID` )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot get a comment that does not exist', function( done ) {
        manager.get( `/api/comments/123456789012345678901234` )
            .then( res => {
                test.string( res.body.message ).is( "Could not find comment" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get a valid comment by ID', function( done ) {
        manager.get( `/api/comments/${comment._id}` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment._id );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot get a private comment without being logged in', function( done ) {
        manager.get( `/api/comments/${comment._id}`, null )
            .then( res => {
                test.string( res.body.message ).is( "That comment is marked private" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a second public comment on the same post', function( done ) {
        manager.post( `/api/posts/${lastPost._id}/comments`, { content: "Hello world 2! __filter__", public: true }, null )
            .then( res => {
                comment2 = res.body.data;
                test.string( res.body.message ).is( "New comment created" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get a public comment without being logged in', function( done ) {
        manager.get( `/api/comments/${comment2._id}`, null )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment2._id );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get comments by user & there are more than 1', function( done ) {
        manager.get( `/api/users/${header.uconfig.adminUser.username}/comments` )
            .then( res => {
                test.number( res.body.count );
                test.bool( res.body.count >= 2 ).isTrue();
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get comments by user & there should be 2 if we filter by keyword', function( done ) {
        manager.get( `/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__` )
            .then( res => {
                test.number( res.body.count );
                test.array( res.body.data ).hasLength( 2 );
                test.bool( res.body.count === 2 ).isTrue();
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get comments by user & should limit whats returned to 1', function( done ) {
        manager.get( `/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__&limit=1` )
            .then( res => {
                test.number( res.body.count );
                test.array( res.body.data ).hasLength( 2 );
                test.bool( res.body.count === 2 ).isTrue();
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get comments by user & should limit whats returned to 1 if not admin', function( done ) {
        manager.get( `/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__`, null )
            .then( res => {
                test.number( res.body.count );
                test.array( res.body.data ).hasLength( 1 );
                test.bool( res.body.count === 1 ).isTrue(); // Count is still 2 as
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a third public comment on the same post, with a parent comment', function( done ) {
        manager.post( `/api/posts/${lastPost._id}/comments/${comment._id}`, { content: "Hello world 3! __filter__", public: true } )
            .then( res => {
                comment3 = res.body.data;
                test.string( res.body.message ).is( "New comment created" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can create a fourth public comment on the same post, with a parent comment', function( done ) {
        manager.post( `/api/posts/${lastPost._id}/comments/${comment._id}`, { content: "Hello world 4! __filter__", public: true } )
            .then( res => {
                comment4 = res.body.data;
                test.string( res.body.message ).is( "New comment created" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get the parent comment and has previously created comment as child', function( done ) {
        manager.get( `/api/comments/${comment._id}` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment._id );
                test.array( res.body.data.children ).contains( [ comment3._id, comment4._id ] );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get a comment with parent & post, and both properties are just ids (not expanded)', function( done ) {
        manager.get( `/api/comments/${comment3._id}` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment3._id );
                test.string( res.body.data.parent ).is( comment._id );
                test.string( res.body.data.post ).is( lastPost._id );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get a comment with parent & post, and both properties are the respective objects (expanded)', function( done ) {
        manager.get( `/api/comments/${comment3._id}?expanded=true` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment3._id );
                test.string( res.body.data.parent ).is( comment._id );
                test.string( res.body.data.post._id ).is( lastPost._id );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a comment with a bad id', function( done ) {
        manager.delete( `/api/comments/abc`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Invalid ID format" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'cannot delete a comment with a valid id but doesn\'t exist', function( done ) {
        manager.delete( `/api/comments/123456789012345678901234`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Could not find a comment with that ID" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can delete the fourth comment', function( done ) {
        manager.delete( `/api/comments/${comment4._id}`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Comment has been successfully removed" );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can get parent comment and comment 4 has been removed', function( done ) {
        manager.get( `/api/comments/${comment._id}` )
            .then( res => {
                test.string( res.body.message ).is( "Found 1 comments" );
                test.string( res.body.data._id ).is( comment._id );
                test.array( res.body.data.children ).contains( [ comment3._id ] );
                test.array( res.body.data.children ).notContains( [ comment4._id ] );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can delete an existing comment', function( done ) {
        manager.delete( `/api/comments/${comment._id}`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Comment has been successfully removed" );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Can delete the temp post', function( done ) {
        manager.delete( `/api/posts/${lastPost._id}`, {} )
            .then( res => {
                test.string( res.body.message ).is( "Post has been successfully removed" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'Cannot get the second comment as it should have been deleted when the post was', function( done ) {
        manager.get( `/api/comments/${comment2._id}` )
            .then( res => {
                test.string( res.body.message ).is( "Could not find comment" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should have the same number of comments as before the tests started', function( done ) {
        manager.get( `/api/comments` )
            .then( res => {
                test.number( res.body.count );
                test.bool( numComments === res.body.count ).isTrue();
                test.bool( res.body.error ).isNotTrue()
                done();
            } ).catch( err => done( err ) );
    } )
} );