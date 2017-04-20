const test = require( 'unit.js' );
let guest, admin, config, user1, user2;

describe( 'Testing bucket creation', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( 'regular user did not create a bucket for another user', function( done ) {
        user1.post( `/buckets/user/${config.adminUser.username} + "/test` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not create a bucket with bad characters', function( done ) {
        user1.post( `/buckets/user/${user1.username}/�BAD!CHARS` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Please only use safe characters" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did create a new bucket called dinosaurs', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Bucket 'dinosaurs' created" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not create a bucket with the same name as an existing one', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "A Bucket with the name 'dinosaurs' has already been registered" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin user did create a bucket with a different name for regular user', function( done ) {
        admin.post( `/buckets/user/${user1.username}/dinosaurs2` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Bucket 'dinosaurs2' created" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user should have 2 buckets', function( done ) {
        user1.get( `/buckets/user/${user1.username}` )
            .then( res => {
                test.array( res.body.data ).hasLength( 2 );
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

    it( 'regular user did remove the bucket dinosaurs', function( done ) {
        user1.delete( `/buckets/dinosaurs2` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )
} )