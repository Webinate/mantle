const test = require( 'unit.js' );
let guest, admin, config, user1, user2, bucket1, bucket2;

describe( '3. Testing bucket creation', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did not create a bucket for another user', async function() {
    const resp = await user1.post( `/buckets/user/${config.adminUser.username}/test` );
    const json = await resp.json();
    test.number( resp.status ).is( 403 );

    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create a bucket with bad characters', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/�BAD!CHARS` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );

    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "Please only use safe characters" );
  } )

  it( 'regular user did create a new bucket called dinosaurs', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.object( json ).hasProperty( "_id" );
    test.string( json.name ).is( 'dinosaurs' );
    test.string( json.user ).is( user1.username );
    test.number( json.memoryUsed ).is( 0 );
    test.number( json.created ).isGreaterThan( 0 );
    test.string( json.identifier ).isNot( '' );
    bucket1 = json._id;
  } )

  it( 'regular user did not create a bucket with the same name as an existing one', async function() {
    const resp = await user1.post( `/buckets/user/${user1.username}/dinosaurs` );
    const json = await resp.json();
    test.number( resp.status ).is( 500 );

    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "A Bucket with the name 'dinosaurs' has already been registered" );
  } )

  it( 'admin user did create a bucket with a different name for regular user', async function() {
    const resp = await admin.post( `/buckets/user/${user1.username}/dinosaurs2` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );

    test.object( json ).hasProperty( "_id" );
    test.string( json.name ).is( 'dinosaurs2' );
    test.string( json.user ).is( user1.username );
    bucket2 = json._id;
  } )

  it( 'regular user should have 2 buckets', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 2 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket1}` );
    test.number( resp.status ).is( 204 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket2}` );
    test.number( resp.status ).is( 204 );
  } )
} )