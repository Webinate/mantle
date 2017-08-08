const test = require( 'unit.js' );
let guest, admin, config,
    testUserName = 'fancyUser123',
    testUserEmail = 'fancyUser123@fancy.com',
    activationKey;

describe( 'Testing user activation', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        config = header.config;
    } )

    it( `did remove any existing user called ${testUserName}`, function( done ) {
        admin.delete( `/api/users/${testUserName}` )
            .then( res => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'should register with valid information', function( done ) {
        guest.post( `/api/auth/register`, { username: testUserName, password: "Password", email: testUserEmail } )
            .then( res => {
                test.bool( res.body.error ).isFalse()
                test.string( res.body.message ).is( "Please activate your account with the link sent to your email address" )
                test.object( res.body.user )
                done();
            } ).catch( err => done( err ) );
    } )

    it( `did create an activation key for ${testUserName}`, function( done ) {
        admin.get( `/api/users/${testUserName}?verbose=true` )
            .then( res => {
                test.object( res.body.data ).hasProperty( "registerKey" )
                test.string( res.body.data.registerKey ).isNot( "" );
                activationKey = res.body.data.registerKey;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not log in with an activation code present', function( done ) {
        guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.bool( res.body.authenticated ).isFalse()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "Please authorise your account by clicking on the link that was sent to your email" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not resend an activation with an invalid user', function( done ) {
        guest.get( `/api/auth/NONUSER5/resend-activation` )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "No user exists with the specified details" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did resend an activation email with a valid user', function( done ) {
        guest.get( `/api/auth/${testUserName}/resend-activation` )
            .then( res => {
                test.bool( res.body.error ).isFalse()
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "An activation link has been sent, please check your email for further instructions" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not activate the account now that the activation key has changed', function( done ) {
        guest.code( 302 )
            .contentType( /text\/plain/ )
            .get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}` )
            .then( res => {
                test.string( res.headers[ "location" ] ).contains( "error" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( `did get the renewed activation key for ${testUserName}`, function( done ) {
        admin.get( `/api/users/${testUserName}?verbose=true` )
            .then( res => {
                activationKey = res.body.data.registerKey;
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not activate with an invalid username', function( done ) {
        guest.code( 302 )
            .contentType( /text\/plain/ )
            .get( `/api/auth/activate-account?user=NONUSER` )
            .then( res => {
                test.string( res.headers[ "location" ] ).contains( "error" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not activate with an valid username and no key', function( done ) {
        guest.code( 302 )
            .contentType( /text\/plain/ )
            .get( `/api/auth/activate-account?user=${testUserName}` )
            .then( res => {
                test.string( res.headers[ "location" ] ).contains( "error" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not activate with an valid username and invalid key', function( done ) {
        guest.code( 302 )
            .contentType( /text\/plain/ )
            .get( `/api/auth/activate-account?user=${testUserName}&key=123` )
            .then( res => {
                test.string( res.headers[ "location" ] ).contains( "error" );
                done()
            } ).catch( err => done( err ) );
    } )

    it( 'did activate with a valid username and key', function( done ) {
        guest.code( 302 )
            .contentType( /text\/plain/ )
            .get( `/api/auth/activate-account?user=${testUserName}&key=${activationKey}` )
            .then( res => {
                test.string( res.headers[ "location" ] ).contains( "success" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did log in with valid details and an activated account', function( done ) {
        guest.post( `/api/auth/login`, { username: testUserName, password: "Password" } )
            .then( res => {
                test.bool( res.body.error ).isFalse()
                test.bool( res.body.authenticated ).isTrue()
                test.object( res.body ).hasProperty( "message" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did cleanup the registered user', function( done ) {
        admin.delete( `/api/users/${testUserName}` )
            .then( res => {
                test.string( res.body.message ).is( `User ${testUserName} has been removed` )
                done();
            } ).catch( err => done( err ) );
    } )
} )