const test = require( 'unit.js' );
let guest, admin, config, user1, user2, bucket;

describe( '4. Testing bucket deletion', function() {

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

  it( 'regular user did not delete a bucket that does not exist', async function() {
    const resp = await user1.delete( `/buckets/123456789012345678901234` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.string( json.message ).is( 'A bucket with that ID does not exist' )
  } )

  it( 'regular user did not delete a bucket that does not have a valid id', async function() {
    const resp = await user1.delete( `/buckets/badID` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );
    test.string( json.message ).is( 'Please use a valid object id' )
  } )

  it( 'regular user has 1 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'regular user has 0 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 0 );
  } )
} )