const test = require( 'unit.js' );
const FormData = require( 'form-data' );
const fs = require( 'fs' );

let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
const header = require( '../header.js' );
let fileId = '';
let fileUrl = '';

describe( '10. Testing file accessibility functions', function() {

  before( function() {
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
    form.append( 'small-image.png', fs.readFileSync( filePath ), { filename: 'small-image.png', contentType: 'image/png' } );
    const resp = await user1.post( "/buckets/dinosaurs/upload", form, null, form.getHeaders() );
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user has 1 file', async function() {
    const resp = await user1.get( `/files/users/${user1.username}/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    fileId = json.data[ 0 ].identifier;
    fileUrl = json.data[ 0 ].publicURL;
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'did download the file off the bucket', async function() {
    const agent = header.createAgent( fileUrl );
    const resp = await agent.get( '' );
    test.number( resp.status ).is( 200 );
    test.string( resp.headers.get( 'content-type' ) ).is( 'image/png' );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/dinosaurs` );
    test.number( resp.status ).is( 200 );
  } )
} )