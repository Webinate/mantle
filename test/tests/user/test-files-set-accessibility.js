const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
const header = require( '../header.js' );
let fileId = '';
let fileUrl = '';

describe( 'Testing file accessibility functions', function() {

  before( function() {
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

  it( 'regular user has 1 file', function( done ) {
    user1
      .get( `/files/users/${user1.username}/buckets/dinosaurs` )
      .then(( res ) => {
        fileId = res.body.data[ 0 ].identifier;
        fileUrl = res.body.data[ 0 ].publicURL;
        test.array( res.body.data ).hasLength( 1 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not make a non-file public', function( done ) {
    user1
      .code( 500 )
      .put( `/files/123/make-public`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "File '123' does not exist" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not make a non-file private', function( done ) {
    user1
      .code( 500 )
      .put( `/files/123/make-private`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "File '123' does not exist" )
        done()
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did make a file public', function( done ) {
    user1.put( `/files/${fileId}/make-public`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "File is now public" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did download the file off the bucket', function( done ) {
    header.createAgent( fileUrl )
      .contentType( /image/ )
      .get( '' )
      .then(( res ) => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did make a file private', function( done ) {
    user1.put( `/files/${fileId}/make-private`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "File is now private" );
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