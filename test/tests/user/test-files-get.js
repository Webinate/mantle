const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';

describe( 'Getting uploaded user files', function() {

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

  it( 'regular user did not get files for the admin user bucket', function( done ) {
    user1
      .code( 500 )
      .get( `/files/users/${config.adminUser.username}/buckets/BAD_ENTRY` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not get files for a non existant bucket', function( done ) {
    user1
      .code( 500 )
      .get( `/files/users/${user1.username}/buckets/test` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "Could not find the bucket 'test'" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did upload a file to dinosaurs', function( done ) {
    user1
      .attach( 'small-image', filePath )
      .post( "/buckets/dinosaurs/upload" )
      .then(( res ) => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did upload another file to dinosaurs', function( done ) {
    user1
      .attach( 'small-image', filePath )
      .post( "/buckets/dinosaurs/upload" )
      .then(( res ) => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user fetched 2 files from the dinosaur bucket', function( done ) {
    user1
      .get( `/files/users/${user1.username}/buckets/dinosaurs` )
      .then(( res ) => {
        test.object( res.body ).hasProperty( "message" );
        test.object( res.body ).hasProperty( "data" );
        test.string( res.body.message ).is( "Found [2] files" );
        test.array( res.body.data ).hasLength( 2 );
        test.number( res.body.data[ 0 ].numDownloads ).is( 0 );
        test.number( res.body.data[ 0 ].size ).is( 226 );
        test.string( res.body.data[ 0 ].mimeType ).is( "image/png" );
        test.string( res.body.data[ 0 ].user ).is( user1.username );
        test.object( res.body.data[ 0 ] ).hasProperty( "publicURL" );
        test.bool( res.body.data[ 0 ].isPublic ).isTrue();
        test.object( res.body.data[ 0 ] ).hasProperty( "identifier" );
        test.object( res.body.data[ 0 ] ).hasProperty( "bucketId" );
        test.object( res.body.data[ 0 ] ).hasProperty( "created" );
        test.string( res.body.data[ 0 ].bucketName ).is( "dinosaurs" );
        test.object( res.body.data[ 0 ] ).hasProperty( "_id" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin fetched 2 files from the regular users dinosaur bucket', function( done ) {
    admin
      .get( `/files/users/${user1.username}/buckets/dinosaurs` )
      .then(( res ) => {
        test.string( res.body.message ).is( "Found [2] files" );
        test.array( res.body.data ).hasLength( 2 );
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