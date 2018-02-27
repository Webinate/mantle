const test = require( 'unit.js' );
let guest, admin, config, user1, user2, stats;

describe( '15. Testing setting stat values', function() {

  before( function() {
    const header = require( '../header' ).default;
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular did get its stat information', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    stats = json;
  } )

  it( 'regular user did not create storage calls for admin', async function() {
    const resp = await user1.put( `/stats/storage-calls/${config.adminUser.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage memory for admin', async function() {
    const resp = await user1.put( `/stats/storage-memory/${config.adminUser.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create allocated calls for admin', async function() {
    const resp = await user1.put( `/stats/storage-allocated-calls/${config.adminUser.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create allocated memory for admin', async function() {
    const resp = await user1.put( `/stats/storage-allocated-memory/${config.adminUser.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage calls for itself', async function() {
    const resp = await user1.put( `/stats/storage-calls/${user1.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage memory for itself', async function() {
    const resp = await user1.put( `/stats/storage-memory/${user1.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage allocated calls for itself', async function() {
    const resp = await user1.put( `/stats/storage-allocated-calls/${user1.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'regular user did not create storage allocated memory for itself', async function() {
    const resp = await user1.put( `/stats/storage-allocated-memory/${user1.username}/90000`, {} );
    test.number( resp.status ).is( 403 );
    const json = await resp.json();
    test.object( json ).hasProperty( "message" );
    test.string( json.message ).is( "You don't have permission to make this request" );
  } )

  it( 'did not update the regular stats', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.bool( stats.apiCallsAllocated == json.apiCallsAllocated ).isTrue();
    test.bool( stats.memoryAllocated == json.memoryAllocated ).isTrue();
    test.bool( stats.apiCallsUsed == json.apiCallsUsed ).isTrue();
    test.bool( stats.memoryUsed == json.memoryUsed ).isTrue();
  } )

  it( 'admin can set storage calls for a regular user to 50', async function() {
    const resp = await admin.put( `/stats/storage-calls/${user1.username}/50`, {} );
    test.number( resp.status ).is( 200 );
  } )

  it( 'admin can set storage memory for a regular user to 50', async function() {
    const resp = await admin.put( `/stats/storage-memory/${user1.username}/50`, {} );
    test.number( resp.status ).is( 200 );
  } )

  it( 'admin can set allocated storage calls for a regular user to 100', async function() {
    const resp = await admin.put( `/stats/storage-allocated-calls/${user1.username}/100`, {} );
    test.number( resp.status ).is( 200 );
  } )

  it( 'admin can set allocated memory for a regular user to 100', async function() {
    const resp = await admin.put( `/stats/storage-allocated-memory/${user1.username}/100`, {} );
    test.number( resp.status ).is( 200 );
  } )

  it( 'regular user stats have been updated', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.number( json.apiCallsAllocated ).is( 100 );
    test.number( json.memoryAllocated ).is( 100 );
    test.number( json.apiCallsUsed ).is( 50 );
    test.number( json.memoryUsed ).is( 50 );
  } )

  it( 'admin setting storage back to max', async function() {
    const resp = await admin.put( `/stats/storage-allocated-memory/${user1.username}/${stats.memoryAllocated}`, {} );
    test.number( resp.status ).is( 200 );
  } )
} )