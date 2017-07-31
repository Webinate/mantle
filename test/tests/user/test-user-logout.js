const test = require( 'unit.js' );
let guest, admin, config, user1, user2, agent, numUsers,
    testUserName = 'fancyUser123',
    testUserEmail = 'fancyUser123@fancy.com';

describe( 'Testing users logout', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( `did remove any existing user ${testUserName}`, function( done ) {
        admin.delete( `/api/users/${testUserName}` )
            .then( res => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( `did create & login regular user ${testUserName} with valid details`, function( done ) {
        admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } )
            .then( res => {
                const header = require( '../header.js' );
                return header.createUser( testUserName, 'password', testUserEmail );
            } ).then(( newAgent ) => {
                agent = newAgent;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'user should be logged in', function( done ) {
        agent.get( '/api/auth/authenticated' )
            .then( res => {
                test.bool( res.body.error ).isFalse();
                test.bool( res.body.authenticated ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should log out', function( done ) {
        agent.get( `/api/auth/logout` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'user should be logged out', function( done ) {
        agent.get( '/api/auth/authenticated' )
            .then( res => {
                test.bool( res.body.error ).isFalse();
                test.bool( res.body.authenticated ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did allow the regular user to delete its own account', function( done ) {
        admin.delete( `/api/users/${testUserName}` )
            .then( res => {
                test.string( res.body.message ).is( `User ${testUserName} has been removed` )
                done();
            } ).catch( err => done( err ) );
    } )
} )