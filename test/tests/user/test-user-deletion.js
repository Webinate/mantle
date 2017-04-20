const test = require( 'unit.js' );
let guest, admin, config, user1, user2, agent, numUsers,
    testUserName = 'fancyUser123',
    testUserEmail = 'fancyUser123@fancy.com';

describe( 'Testing deleting users', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( `did removing any existing user ${testUserName}`, function( done ) {
        admin.delete( `/users/${testUserName}` )
            .then( res => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did get the number of users', function( done ) {
        admin.get( `/users` )
            .then( res => {
                test.number( res.body.data.length )
                numUsers = res.body.data.length;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not allow a regular user to remove another user', function( done ) {
        user1.delete( `/users/${user2.username}` )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "You don't have permission to make this request" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( `did create & login regular user ${testUserName} with valid details`, function( done ) {
        admin.post( `/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } )
            .then( res => {
                const header = require( '../header.js' );
                return header.createUser( testUserName, 'password', testUserEmail );
            } ).then(( newAgent ) => {
                agent = newAgent;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did allow the regular user to delete its own account', function( done ) {
        agent.delete( `/users/${testUserName}` )
            .then( res => {
                test.string( res.body.message ).is( `User ${testUserName} has been removed` )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did have the same number of users as before the tests started', function( done ) {
        admin.get( `/users` )
            .then( res => {
                test.bool( res.body.data.length === numUsers ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )
} )