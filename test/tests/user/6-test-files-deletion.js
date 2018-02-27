const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

let guest, admin, config, user1, user2, bucket;
const filePath = './test/media/file.png';
let fileId;

describe( '6. Testing files deletion', function() {

  before( function() {
    const header = require( '../header' ).default;
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
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user has 1 file', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    fileId = json.data[ 0 ]._id;
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'regular user did not remove a file with a bad id', async function() {
    const resp = await user1.delete( `/files/123` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.string( json.message ).is( 'Invalid file ID format' );
  } )

  it( 'regular user did remove a file with a valid id', async function() {
    const resp = await user1.delete( `/files/${fileId}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'regular user has 0 files', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/${bucket}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 0 );
  } )

  // TODO: Add a test for regular user deletion permission denial?
  // TODO: Add a test for admin deletion of user file?

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    test.number( resp.status ).is( 204 );
  } )
} )