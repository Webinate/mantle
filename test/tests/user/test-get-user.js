const test = require( 'unit.js' );
let guest, admin, config;

describe( 'Getting user data', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        config = header.config;
    } )

    it( 'should allow admin access to basic data', function( done ) {
        admin.get( `/api/users/${config.adminUser.username}` )
            .then( res => {
                test.string( res.body.message ).is( "Found mat" )
                test.string( res.body.data._id )
                test.value( res.body.data.email ).isUndefined()
                test.number( res.body.data.lastLoggedIn ).isNotNaN()
                test.value( res.body.data.password ).isUndefined()
                test.value( res.body.data.registerKey ).isUndefined()
                test.value( res.body.data.sessionId ).isUndefined()
                test.string( res.body.data.username ).is( config.adminUser.username )
                test.number( res.body.data.privileges ).is( 1 )
                test.value( res.body.data.passwordTag ).isUndefined()
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should allow admin access to sensitive data', function( done ) {
        admin.get( `/api/users/${config.adminUser.username}?verbose=true` )
            .then( res => {
                test.string( res.body.message ).is( "Found mat" )
                test.string( res.body.data._id )
                test.string( res.body.data.email ).is( config.adminUser.email )
                test.number( res.body.data.lastLoggedIn ).isNotNaN()
                test.value( res.body.data.password )
                test.value( res.body.data.registerKey )
                test.value( res.body.data.sessionId )
                test.string( res.body.data.username ).is( config.adminUser.username )
                test.number( res.body.data.privileges ).is( 1 )
                test.value( res.body.data.passwordTag )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should get admin user data by email without sensitive details', function( done ) {
        admin.get( `/api/users/${config.adminUser.email}` )
            .then( res => {
                test.string( res.body.message ).is( "Found mat" )
                test.string( res.body.data._id )
                test.value( res.body.data.email ).isUndefined()
                test.number( res.body.data.lastLoggedIn ).isNotNaN()
                test.value( res.body.data.password ).isUndefined()
                test.value( res.body.data.registerKey ).isUndefined()
                test.value( res.body.data.sessionId ).isUndefined()
                test.string( res.body.data.username ).is( config.adminUser.username )
                test.number( res.body.data.privileges ).is( 1 )
                test.value( res.body.data.passwordTag ).isUndefined()
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should get admin user data by email with sensitive details', function( done ) {
        admin.get( `/api/users/${config.adminUser.email}?verbose=true` )
            .then( res => {
                test.string( res.body.message ).is( "Found mat" )
                test.string( res.body.data._id )
                test.string( res.body.data.email ).is( config.adminUser.email )
                test.number( res.body.data.lastLoggedIn ).isNotNaN()
                test.value( res.body.data.password )
                test.value( res.body.data.registerKey )
                test.value( res.body.data.sessionId )
                test.value( res.body.data.passwordTag )
                test.string( res.body.data.username ).is( config.adminUser.username )
                test.number( res.body.data.privileges ).is( 1 )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should get no user with username', function( done ) {
        guest
            .code( 500 )
            .get( `/api/users/${config.adminUser.username}` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "You must be logged in to make this request" )
                done();
            } ).catch( err => done( err ) );

    } ).timeout( 20000 )

    it( 'should get no user with email or verbose', function( done ) {
        guest
            .code( 500 )
            .get( `/api/users/${config.adminUser.email}?verbose=true` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "You must be logged in to make this request" )
                done();
            } ).catch( err => done( err ) );

    } ).timeout( 20000 )
} )