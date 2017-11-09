const test = require( 'unit.js' );
let guest, admin, config, user1, user2, bucket;

describe( '5. Testing bucket get requests', function() {

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

  it( 'regular user has 1 bucket', async function() {
    const resp = await user1.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 1 );
    const bucket = json.data[ 0 ];
    test.object( bucket ).hasProperty( "_id" );
    test.string( bucket.name ).is( 'dinosaurs' );
    test.string( bucket.user ).is( user1.username );
    test.number( bucket.memoryUsed ).is( 0 );
    test.number( bucket.created ).isGreaterThan( 0 );
    test.string( bucket.identifier ).isNot( '' );
  } )

  it( 'regular user did not get buckets for admin', async function() {
    const resp = await user1.get( `/buckets/user/${config.adminUser.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 403 );
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'other regular user did not get buckets for regular user', async function() {
    const resp = await user2.get( `/buckets/user/${config.adminUser.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 403 );

    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );

  } )

  it( 'admin can see regular user has 1 bucket', async function() {
    const resp = await admin.get( `/buckets/user/${user1.username}` );
    const json = await resp.json();
    test.number( resp.status ).is( 200 );
    test.array( json.data ).hasLength( 1 );
  } )

  it( 'regular user did remove the bucket dinosaurs', async function() {
    const resp = await user1.delete( `/buckets/${bucket}` );
    test.number( resp.status ).is( 204 );
  } )
} )