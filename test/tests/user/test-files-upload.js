const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';

describe( 'Testing file uploads', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( 'regular user did create a bucket dinosaurs', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user has 0 files in the bucket', function( done ) {
        user1
            .get( `/files/users/${user1.username}/buckets/dinosaurs` )
            .then( ( res ) => {
                test.string( res.body.message ).is( "Found [0] files" );
                test.array( res.body.data ).hasLength( 0 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not upload a file to a bucket that does not exist', function( done ) {
        user1.attach( '"�$^&&', filePath )
            .post( "/buckets/dinosaurs3/upload" )
            .then( (res) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "No bucket exists with the name 'dinosaurs3'" );
                test.array( res.body.tokens ).hasLength( 0 );
                test.bool( res.body.error ).isTrue();
                done()
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not upload a file when the meta was invalid', function( done ) {
        user1
            .setContentType('application/x-www-form-urlencoded')
            .fields( {'meta': 'BAD META'} )
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Error: Meta data is not a valid JSON: SyntaxError: Unexpected token B in JSON at position 0" );
                test.array( res.body.tokens ).hasLength( 0 );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did upload a file when the meta was valid', function( done ) {
        user1
            .setContentType('application/x-www-form-urlencoded')
            .fields( {'meta':  '{ "meta" : "good" }'} )
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did upload a file to dinosaurs', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( (res) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user uploaded 2 files, the second with meta', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .get( `/files/users/${user1.username}/buckets/dinosaurs` )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "data" );
                test.string( res.body.message ).is( "Found [2] files" );
                test.array( res.body.data ).hasLength( 2 );
                test.object( res.body.data[ 0 ] ).hasProperty( "meta" );
                test.string( res.body.data[ 0 ].meta.meta ).is( "good" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did remove the bucket dinosaurs', function( done ) {
        user1.delete( `/buckets/dinosaurs` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )
} )