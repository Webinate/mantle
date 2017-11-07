const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

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

  it( 'regular user did create a bucket dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ) );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
  } )

  it( 'uploaded file has the name "file.png"', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    fileId = json.data[ 0 ].identifier;
    test.string( json.data[ 0 ].name ).is( "small-image.png" );
  } )

  it( 'regular user did not rename an incorrect file to testy', async function() {
    const resp = await user1.put( `/files/123/rename-file`, { name: "testy" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "File '123' does not exist" );
  } )

  it( 'regular user regular user did not rename a correct file with an empty name', async function() {
    const resp = await user1.put( `/files/${fileId}/rename-file`, { name: "" } );
    test.number( resp.status ).is( 500 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Please specify the new name of the file" );
  } )

  it( 'regular user did rename a correct file to testy', async function() {
    const resp = await user1.put( `/files/${fileId}/rename-file`, { name: "testy" } );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Renamed file to 'testy'" );
  } )

  it( 'did rename the file to "testy" as reflected in the GET', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json.data[ 0 ].name ).is( "testy" );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
  } )
} )