const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

let guest, admin, config, user1, user2, bucket;
const filePath = './test/media/file.png';

describe( '8. Getting uploaded user files', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    bucket = json._id;
  } )

  it( 'regular user did not get files for the admin user bucket', async function() {
    const resp = await user1.get( `/files/users/${config.adminUser.username}/buckets/BAD_ENTRY` );
    const json = await resp.json();
    test.number( resp.status ).is( 403 );
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not get files for a bucket with bad id', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/test` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Please use a valid identifier for bucketId" );
  } )

  it( 'regular user did not get files for a non existant bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/123456789012345678901234` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Could not find the bucket resource" );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user did upload another file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user fetched 2 files from the dinosaur bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.object( json ).hasProperty( "data" );
    test.array( json.data ).hasLength( 2 );
    test.number( json.data[ 0 ].numDownloads ).is( 0 );
    test.number( json.data[ 0 ].size ).is( 228 );
    test.string( json.data[ 0 ].mimeType ).is( "image/png" );
    test.string( json.data[ 0 ].user ).is( user1.username );
    test.object( json.data[ 0 ] ).hasProperty( "publicURL" );
    test.bool( json.data[ 0 ].isPublic ).isTrue();
    test.object( json.data[ 0 ] ).hasProperty( "identifier" );
    test.object( json.data[ 0 ] ).hasProperty( "bucketId" );
    test.object( json.data[ 0 ] ).hasProperty( "created" );
    test.string( json.data[ 0 ].bucketName ).is( "dinosaurs" );
    test.object( json.data[ 0 ] ).hasProperty( "_id" );
  } )

  it( 'admin fetched 2 files from the regular users dinosaur bucket', async function() {
    const resp = await admin.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 2 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    test.number( resp.status ).is( 204 );
  } )
} )