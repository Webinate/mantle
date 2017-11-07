const test = require( 'unit.js' );
let guest, admin, config, user1, user2;

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
  } )

  it( 'regular user did not delete any buckets when the name is wrong', async function() {
    const resp = await user1.delete( `/buckets/dinosaurs3,dinosaurs4` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).isEmpty();
  } )

  it( 'regular user did not remove a bucket with a bad name', async function() {
    const resp = await user1.delete( `/buckets/123` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 0 );
  } )

  it( 'regular user has 1 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/dinosaurs` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'regular user has 0 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 0 );
  } )
} )