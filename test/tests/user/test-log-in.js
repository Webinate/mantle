const test = require( 'unit.js' );
let guest, config, admin;

describe( 'Testing user logging in', function() {

    before(function(){
        const header = require( '../header.js' );
        guest = header.users.guest;
        config = header.config;
        admin = header.users.admin;
    })

    it( 'did not log in with empty credentials', function( done ) {
        guest.post( '/auth/login', { username: "", password: "" } )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.bool( res.body.authenticated ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not log in with bad credentials', function( done ) {
        guest.post( '/auth/login', { username: "$%^\}{}\"&*[]@~�&$", password: "$%^&*�&@#`{}/\"�%\"$" } )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.bool( res.body.authenticated ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not log in with false credentials', function( done ) {
        guest.post( '/auth/login', { username: "GeorgeTheTwat", password: "FakePass" } )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.bool( res.body.authenticated ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did not log in with a valid username but invalid password', function( done ) {
        guest.post( '/auth/login', { username: config.adminUser.username, password: "FakePass" } )
            .then( res => {
                test.bool( res.body.error ).isTrue()
                test.bool( res.body.authenticated ).isNotTrue()
                test.object( res.body ).hasProperty( "message" )
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did log in with a valid username & valid password', function( done ) {
        guest.post( '/auth/login', { username: config.adminUser.username, password: config.adminUser.password } )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                test.bool( res.body.authenticated ).isTrue()
                test.object( res.body ).hasProperty( "message" )
                admin.updateCookie( res );
                done();
            } ).catch( err => done( err ) );
    } )
} )