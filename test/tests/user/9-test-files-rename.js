const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

let guest, admin, config, user1, user2, bucket;
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

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    bucket = json._id;
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, form.getHeaders() );
    test.number( resp.status ).is( 200 );
  } )

  it( 'uploaded file has the name "file.png"', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    fileId = json.data[ 0 ]._id;
    test.string( json.data[ 0 ].name ).is( "small-image.png" );
  } )

  it( 'regular user did not rename an incorrect file to testy', async function() {
    const resp = await user1.put( `/files/123`, { name: "testy" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Invalid ID format" );
  } )

  it( 'regular user regular user did not rename a correct file with an empty name', async function() {
    const resp = await user1.put( `/files/${fileId}`, { name: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "The character length of name is too short, please keep it above 3" );
  } )

  it( 'regular user did rename a correct file to testy', async function() {
    const resp = await user1.put( `/files/${fileId}`, { name: "testy" } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "_id" );
    test.string( json.name ).is( 'testy' );
    test.string( json.user ).is( user1.username );
  } )

  it( 'regular user cannot set readonly attributes', async function() {
    const resp = await user1.put( `/files/${fileId}`, {
      user: 'badvalue',
      bucketId: 'badvalue',
      bucketName: 'badvalue',
      publicURL: 'badvalue',
      mimeType: 'badvalue',
      parentFile: '123456789012345678901234',
      size: 20
    } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.user ).isNot( 'badvalue' );
    test.string( json.bucketId ).isNot( 'badvalue' );
    test.string( json.bucketName ).isNot( 'badvalue' );
    test.string( json.publicURL ).isNot( 'badvalue' );
    test.string( json.mimeType ).isNot( 'badvalue' );
    test.string( json.parentFile ).isNot( 'badvalue' );
    test.number( json.size ).isNot( 20 );
  } )

  it( 'did rename the file to "testy" as reflected in the GET', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data[ 0 ].name ).is( "testy" );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    test.number( resp.status ).is( 204 );
  } )
} )