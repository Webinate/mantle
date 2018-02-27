const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
let fileId = '';

describe( '14. Getting and setting user media stat usage', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user updated its stats accordingly', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.apiCallsUsed ).is( 9 );
    test.number( json.data.memoryUsed ).is( 226 * 2 );
  } )

  it( 'regular user did upload another file to dinosaurs2', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs2/upload", form, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "Upload complete. [1] Files have been saved." );
    test.array( json.tokens ).hasLength( 1 );
    test.string( json.tokens[ 0 ].field ).is( "small-image.png" );
    test.string( json.tokens[ 0 ].file ).is( "small-image.png" );
    test.bool( json.tokens[ 0 ].error ).isNotTrue();
    test.string( json.tokens[ 0 ].errorMsg ).is( "" );
    test.object( json.tokens[ 0 ] ).hasProperty( "file" );
  } )

  it( 'regular user updated its stats with the 2nd upload accordingly', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.apiCallsUsed ).is( 10 );
    test.number( json.data.memoryUsed ).is( 226 * 3 );
  } )

  it( 'regular user did update the api calls to 5', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.apiCallsUsed ).is( 11 );
  } )

  it( 'regular user did upload another file to dinosaurs2', async function() {
    const form = new FormData();
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs2/upload", form, form.getHeaders() );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.object( json ).hasProperty( "tokens" );
    test.string( json.message ).is( "Upload complete. [1] Files have been saved." );
    test.array( json.tokens ).hasLength( 1 );
    test.string( json.tokens[ 0 ].field ).is( "small-image.png" );
    test.string( json.tokens[ 0 ].file ).is( "small-image.png" );
    test.bool( json.tokens[ 0 ].error ).isNotTrue();
    test.string( json.tokens[ 0 ].errorMsg ).is( "" );
    test.object( json.tokens[ 0 ] ).hasProperty( "file" );
  } )

  it( 'regular user fetched the uploaded file Id of the dinosaur2 bucket', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs2` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    fileId = json.data[ 1 ].identifier;
  } )

  it( 'regular user updated its stats to reflect a file was deleted', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.apiCallsUsed ).is( 14 );
    test.number( json.data.memoryUsed ).is( 226 * 3 );
  } )

  it( 'regular user updated its stats that both a file and bucket were deleted', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.data.apiCallsUsed ).is( 16 );
    test.number( json.data.memoryUsed ).is( 226 * 2 );
  } )
} )