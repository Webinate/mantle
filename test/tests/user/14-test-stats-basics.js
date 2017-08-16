const test = require( 'unit.js' );
let guest, admin, config, user1, user2;

describe( '14. Getting and setting user stats', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did not get stats for admin', function( done ) {
    user1
      .code( 500 )
      .get( `/stats/users/${config.adminUser.username}/get-stats` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create stats for admin', function( done ) {
    user1
      .code( 500 )
      .post( `/stats/create-stats/${config.adminUser.username}`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did get default stats for itself', function( done ) {
    user1.get( `/stats/users/${user1.username}/get-stats` )
      .then( res => {
        test.string( res.body.message ).is( `Successfully retrieved ${user1.username}'s stats` );
        test.object( res.body ).hasProperty( "message" );
        test.object( res.body ).hasProperty( "data" );
        test.object( res.body.data ).hasProperty( "_id" );
        test.string( res.body.data.user ).is( user1.username );
        test.number( res.body.data.apiCallsAllocated ).is( 20000 );
        test.number( res.body.data.memoryAllocated ).is( 500000000 );
        test.number( res.body.data.apiCallsUsed ).is( 0 );
        test.number( res.body.data.memoryUsed ).is( 0 );
        done();
      } ).catch( err => done( err ) );
  } )
} )