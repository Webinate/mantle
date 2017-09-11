const test = require( 'unit.js' );
let guest, admin, config, user1, user2, stats;

describe( '15. Testing setting stat values', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular did get its stat information', function( done ) {
    user1.get( `/stats/users/${user1.username}/get-stats` )
      .then( res => {
        test.string( res.body.message ).is( `Successfully retrieved ${user1.username}'s stats` );
        stats = res.body.data;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage calls for admin', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-calls/${config.adminUser.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage memory for admin', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-memory/${config.adminUser.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create allocated calls for admin', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-allocated-calls/${config.adminUser.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create allocated memory for admin', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-allocated-memory/${config.adminUser.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage calls for itself', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-calls/${user1.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage memory for itself', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-memory/${user1.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage allocated calls for itself', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-allocated-calls/${user1.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user did not create storage allocated memory for itself', function( done ) {
    user1
      .code( 403 )
      .put( `/stats/storage-allocated-memory/${user1.username}/90000`, {} )
      .then( res => {
        test.object( res.body ).hasProperty( "message" );
        test.string( res.body.message ).is( "You don't have permission to make this request" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not update the regular stats', function( done ) {
    user1.get( `/stats/users/${user1.username}/get-stats` )
      .then( res => {
        test.string( res.body.message ).is( `Successfully retrieved ${user1.username}'s stats` );
        test.bool( stats.apiCallsAllocated == res.body.data.apiCallsAllocated ).isTrue();
        test.bool( stats.memoryAllocated == res.body.data.memoryAllocated ).isTrue();
        test.bool( stats.apiCallsUsed == res.body.data.apiCallsUsed ).isTrue();
        test.bool( stats.memoryUsed == res.body.data.memoryUsed ).isTrue();
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin can set storage calls for a regular user to 50', function( done ) {
    admin.put( `/stats/storage-calls/${user1.username}/50`, {} )
      .then( res => {
        test.string( res.body.message ).is( "Updated the user API calls to [50]" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin can set storage memory for a regular user to 50', function( done ) {
    admin.put( `/stats/storage-memory/${user1.username}/50`, {} )
      .then( res => {
        test.string( res.body.message ).is( "Updated the user memory to [50] bytes" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin can set allocated storage calls for a regular user to 100', function( done ) {
    admin.put( `/stats/storage-allocated-calls/${user1.username}/100`, {} )
      .then( res => {
        test.string( res.body.message ).is( "Updated the user API calls to [100]" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin can set allocated memory for a regular user to 100', function( done ) {
    admin.put( `/stats/storage-allocated-memory/${user1.username}/100`, {} )
      .then( res => {
        test.string( res.body.message ).is( "Updated the user memory to [100] bytes" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'regular user stats have been updated', function( done ) {
    user1.get( `/stats/users/${user1.username}/get-stats` )
      .then( res => {
        test.string( res.body.message ).is( `Successfully retrieved ${user1.username}'s stats` );
        test.number( res.body.data.apiCallsAllocated ).is( 100 );
        test.number( res.body.data.memoryAllocated ).is( 100 );
        test.number( res.body.data.apiCallsUsed ).is( 50 );
        test.number( res.body.data.memoryUsed ).is( 50 );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'admin setting storage back to max', function( done ) {
    admin.put( `/stats/storage-allocated-memory/${user1.username}/${stats.memoryAllocated}`, {} )
      .then( res => {
        done();
      } ).catch( err => done( err ) );
  } )
} )