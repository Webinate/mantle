const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
let fileId;

describe( 'Testing files deletion', function() {

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
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did upload a file to dinosaurs', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then(( res ) => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user has 1 file', function( done ) {
        user1
            .get( `/files/users/${user1.username}/buckets/dinosaurs` )
            .then(( res ) => {
                fileId = res.body.data[ 0 ].identifier;
                test.array( res.body.data ).hasLength( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not remove a file with a bad id', function( done ) {
        user1.delete( `/files/123` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [0] files" );
                test.array( res.body.data ).hasLength( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did remove a file with a valid id', function( done ) {
        user1.delete( `/files/${fileId}` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [1] files" );
                test.array( res.body.data ).hasLength( 1 );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user has 0 files', function( done ) {
        user1
            .get( `/files/users/${user1.username}/buckets/dinosaurs` )
            .then(( res ) => {
                test.array( res.body.data ).hasLength( 0 );
                done();
            } ).catch( err => done( err ) );
    } )

    // TODO: Add a test for regular user deletion permission denial?
    // TODO: Add a test for admin deletion of user file?

    it( 'regular user did remove the bucket dinosaurs', function( done ) {
        user1.delete( `/buckets/dinosaurs` )
            .then( res => {
                done();
            } ).catch( err => done( err ) );
    } )
} )