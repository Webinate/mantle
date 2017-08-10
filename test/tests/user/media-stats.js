const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
let fileId = '';

describe( 'Getting and setting user media stat usage', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( 'regular user updated its stats accordingly', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 9 );
                test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did upload another file to dinosaurs2', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs2/upload" )
            .then(( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user updated its stats with the 2nd upload accordingly', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 10 );
                test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'guest did not download a file with an invalid id anonomously', function( done ) {
        guest.code( 404 )
            .get( `/files/123/download` )
            .then( res => {
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'guest did download an image file with a valid id anonomously', function( done ) {
        guest
            .contentLength( "226" )
            .contentType( /image/ )
            .get( "/files/" + fileId + "/download" )
            .then(( res ) => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did update the api calls to 5', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 11 );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did upload another file to dinosaurs2', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs2/upload" )
            .then(( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user fetched the uploaded file Id of the dinosaur2 bucket', function( done ) {
        user1.get( `/files/users/${user1.username}/buckets/dinosaurs2` )
            .then( res => {
                fileId = res.body.data[ 1 ].identifier;
                done();
            } ).catch( err => done( err ) );

    } )


    it( 'regular user updated its stats to reflect a file was deleted', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 14 );
                test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user updated its stats that both a file and bucket were deleted', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 16 );
                test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                done();
            } ).catch( err => done( err ) );

    } )
} )