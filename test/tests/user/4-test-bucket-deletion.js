const test = require( 'unit.js' );
let guest, admin, config, user1, user2;

describe( '4. Testing bucket deletion', function() {

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

  it( 'regular user did not delete any buckets when the name is wrong', function( done ) {
    user1.delete( `/buckets/dinosaurs3,dinosaurs4` )
      .then( res => {
        test.array( res.body.data ).isEmpty();
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not remove a bucket with a bad name', function( done ) {
    user1.delete( `/buckets/123` )
      .then( res => {
        test.array( res.body.data ).hasLength( 0 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user has 1 bucket', function( done ) {
    user1.get( `/buckets/user/${user1.username}` )
      .then( res => {
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did remove the bucket dinosaurs', function( done ) {
    user1.delete( `/buckets/dinosaurs` )
      .then( res => {
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user has 0 bucket', function( done ) {
    user1.get( `/buckets/user/${user1.username}` )
      .then( res => {
        test.array( res.body.data ).hasLength( 0 );
        done();
      } ).catch( err => done( err ) );
  } )
} )