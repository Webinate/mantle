const test = require( 'unit.js' );
let guest, admin, config, user1, user2, numUsers,
    testUserName = 'fancyUser123',
    testUserEmail = 'fancyUser123@fancy.com';

describe( 'Testing fetching users', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( 'did get the number of users before the tests begin', function( done ) {
        admin.get( `/api/users` )
            .then( res => {
                test.number( res.body.data.length )
                numUsers = res.body.data.length;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not allow a regular user to access the admin user details', function( done ) {
        user1
            .code( 500 )
            .get( `/api/users/${admin.username}?verbose=true` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "You don't have permission to make this request" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not allow a regular user to access another user details', function( done ) {
        user2
            .code( 500 )
            .get( `/api/users/${admin.username}?verbose=true` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "You don't have permission to make this request" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did get regular users own data', function( done ) {
        user1.get( `/api/users/${user1.username}?verbose=true` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.object( res.body ).hasProperty( "data" )
                test.string( res.body.data._id )
                test.string( res.body.data.email ).is( user1.email )
                test.number( res.body.data.lastLoggedIn ).isNotNaN()
                test.value( res.body.data.password )
                test.value( res.body.data.registerKey )
                test.value( res.body.data.sessionId )
                test.value( res.body.data.passwordTag )
                test.string( res.body.data.username ).is( user1.username )
                test.number( res.body.data.privileges ).is( 3 )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did have the same number of users as before the tests started', function( done ) {
        admin.get( `/api/users` )
            .then( res => {
                test.bool( res.body.data.length === numUsers ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )
} )