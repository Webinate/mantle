const test = require( 'unit.js' );
const assert = require( 'assert' );
let guest, admin, config, user1, user2;

describe( '1. Getting and setting user stats', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    user2 = header.users.user2;
    config = header.config;
  } )

  it( 'regular user did not get stats for admin', async function() {
    const resp = await user1.get( `/stats/users/${config.adminUser.username}/get-stats` );
    const json = await resp.json();
    assert.strictEqual( resp.status, 403 );
    assert( json.message );
    assert.deepEqual( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did not create stats for admin', async function() {
    const resp = await user1.post( `/stats/create-stats/${config.adminUser.username}` );
    const json = await resp.json();
    assert.strictEqual( resp.status, 403 );
    assert( json.message );
    assert( json.message, "You don't have permission to make this request" );
  } )

  it( 'regular user did get default stats for itself', async function() {
    const resp = await user1.get( `/stats/users/${user1.username}/get-stats` );
    const json = await resp.json();
    assert.strictEqual( resp.status, 200 );

    assert( json.data );
    assert( json.data._id );
    assert.equal( json.data.user, user1.username );
    assert.equal( json.data.apiCallsAllocated, 20000 );
    assert.equal( json.data.memoryAllocated, 500000000 );
    assert.equal( json.data.apiCallsUsed, 0 );
    assert.equal( json.data.memoryUsed, 0 );
  } )
} )