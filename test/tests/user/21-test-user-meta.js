const test = require( 'unit.js' );
let guest, admin, config;

describe( '21. Getting and setting user meta data', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'admin did set user meta data object', async function() {
    const resp = await admin.post( `/api/users/${config.adminUser.username}/meta`, { value: { sister: "sam", brother: "mat" } } );
    test.number( resp.status ).is( 200 );
  } )

  it( 'admin did get user meta value "sister"', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.username}/meta/sister` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json ).is( "sam" )
  } )

  it( 'admin did get user meta value "brother"', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.username}/meta/brother` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json ).is( "mat" )
  } )

  it( 'admin did update user meta "brother" to john', async function() {
    const resp = await admin.post( `/api/users/${config.adminUser.username}/meta/brother`, { value: "john" } );
    test.number( resp.status ).is( 200 );
  } )

  it( 'admin did get user meta "brother" and its john', async function() {
    const resp = await admin.get( `/api/users/${config.adminUser.username}/meta/brother` );
    test.number( resp.status ).is( 200 );
    const json = await resp.json();
    test.string( json ).is( "john" )
  } )

  it( 'admin did set clear meta data', async function() {
    const resp = await admin.post( `/api/users/${config.adminUser.username}/meta`, {} );
    test.number( resp.status ).is( 200 );
  } )
} )