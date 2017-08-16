const test = require( 'unit.js' );
let guest, admin, config, user1, user2;

describe( '5. Testing bucket get requests', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did create a bucket dinosaurs', function( done ) {
    user1.post( `/buckets/user/${user1.username}/dinosaurs` )
      .then( res => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user has 1 bucket', function( done ) {
    user1.get( `/buckets/user/${user1.username}` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "Found [1] buckets" );
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not get buckets for admin', function( done ) {
    user1
      .code( 500 )
      .get( `/buckets/user/${config.adminUser.username}` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'other regular user did not get buckets for regular user', function( done ) {
    user2
      .code( 500 )
      .get( `/buckets/user/${config.adminUser.username}` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin can see regular user has 1 bucket', function( done ) {
    admin.get( `/buckets/user/${user1.username}` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "Found [1] buckets" );
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did remove the bucket dinosaurs', function( done ) {
    user1.delete( `/buckets/dinosaurs` )
      .then( res => {
        done();
      } ).catch( err => done( err ) );
  } )
} )