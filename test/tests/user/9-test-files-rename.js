const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';

describe( '9. Testing file renaming', function() {

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

  it( 'regular user did upload a file to dinosaurs', function( done ) {
    user1
      .attach( 'small-image', filePath )
      .post( "/buckets/dinosaurs/upload" )
      .then(( res ) => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'uploaded file has the name "file.png"', function( done ) {
    user1
      .attach( 'small-image', filePath )
      .get( `/files/users/${user1.username}/buckets/dinosaurs` )
      .then(( res ) => {
        fileId = res.body.data[ 0 ].identifier;
        test.string( res.body.message ).is( "Found [1] files" );
        test.string( res.body.data[ 0 ].name ).is( "file.png" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not rename an incorrect file to testy', function( done ) {
    user1
      .code( 500 )
      .put( `/files/123/rename-file`, { name: "testy" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "File '123' does not exist" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user regular user did not rename a correct file with an empty name', function( done ) {
    user1
      .code( 500 )
      .put( `/files/${fileId}/rename-file`, { name: "" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "Please specify the new name of the file" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did rename a correct file to testy', function( done ) {
    user1.put( `/files/${fileId}/rename-file`, { name: "testy" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "Renamed file to 'testy'" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did rename the file to "testy" as reflected in the GET', function( done ) {
    user1
      .attach( 'small-image', filePath )
      .get( `/files/users/${user1.username}/buckets/dinosaurs` )
      .then(( res ) => {
        test.string( res.body.data[ 0 ].name ).is( "testy" );
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