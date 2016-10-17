var test = require( 'unit.js' );
var header = require( './header.js' ).singleton();

/**
 * Log in as an admin user and store the cookie for later
 */
describe( 'Log in as an admin user', function() {
    it( 'logged in with a valid username & valid password', function( done ) {
        header.usersAgent
            .post( '/users/login' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
            .send( { username: header.uconfig.adminUser.username, password: header.uconfig.adminUser.password })
            .end( function( err, res ) {
                test.bool( res.body.error ).isNotTrue()
                    .bool( res.body.authenticated ).isTrue()
                    .object( res.body ).hasProperty( "message" )

                header.adminCookie = res.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];
                done();
            });
    }).timeout( 25000 )
});