const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';

describe( '11. Testing file uploads', function() {

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

  it( 'regular user has 0 files in the bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.array( json.data ).hasLength( 0 );
  } )

  it( 'regular user did not upload a file to a bucket that does not exist', async function() {

    const form = new FormData();
    form.append( '"�$^&&', fs.readFileSync( filePath ) );
    const resp = await user1.post( "/buckets/dinosaurs3/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "No bucket exists with the name 'dinosaurs3'" );
    test.array( json.tokens ).hasLength( 0 );
  } )

  it( 'regular user did not upload a file when the meta was invalid', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    form.append( 'meta', 'BAD META' )
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "Error: Meta data is not a valid JSON: SyntaxError: Unexpected token B in JSON at position 0" );
    test.array( json.tokens ).hasLength( 0 );
  } )

  it( 'regular user did upload a file when the meta was valid', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    form.append( 'meta', '{ "meta" : "good" }' )
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "Upload complete. [1] Files have been saved." );
    test.array( json.tokens ).hasLength( 1 );
  } )

  it( 'regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "Upload complete. [1] Files have been saved." );
    test.array( json.tokens ).hasLength( 1 );
    test.string( json.tokens[ 0 ].field ).is( "small-image.png" );
    test.string( json.tokens[ 0 ].filename ).is( "small-image.png" );
    test.bool( json.tokens[ 0 ].error ).isNotTrue();
    test.string( json.tokens[ 0 ].errorMsg ).is( "" );
    test.object( json.tokens[ 0 ] ).hasProperty( "file" );
  } )

  it( 'regular user uploaded 2 files, the second with meta', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "data" );
    test.array( json.data ).hasLength( 2 );
    test.object( json.data[ 0 ] ).hasProperty( "meta" );
    test.string( json.data[ 0 ].meta.meta ).is( "good" );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
  } )
} )