const test = require( 'unit.js' );
let guest, admin, config;

describe( 'Getting and setting user meta data', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        config = header.config;
    } )

    it( 'admin did set user meta data object', function( done ) {
        admin.post( `/api/users/${config.adminUser.username}/meta`, { value: { sister: "sam", brother: "mat" } } )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "User's data has been updated" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin did get user meta value "sister"', function( done ) {
        admin.get( `/api/users/${config.adminUser.username}/meta/sister` )
            .then( res => {
                test.string( res.body ).is( "sam" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin did get user meta value "brother"', function( done ) {
        admin.get( `/api/users/${config.adminUser.username}/meta/brother` )
            .then( res => {
                test.string( res.body ).is( "mat" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin did update user meta "brother" to john', function( done ) {
        admin.post( `/api/users/${config.adminUser.username}/meta/brother`, { value: "john" } )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "Value 'brother' has been updated" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin did get user meta "brother" and its john', function( done ) {
        admin.get( `/api/users/${config.adminUser.username}/meta/brother` )
            .then( res => {
                test.string( res.body ).is( "john" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'admin did set clear meta data', function( done ) {
        admin.post( `/api/users/${config.adminUser.username}/meta`, {} )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "User's data has been updated" )
                done();
            } ).catch( err => done( err ) );
    } )
} )