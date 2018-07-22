import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';
import { IVolume } from '../../../src';

let volumeJson: IVolume<'client'>;

describe( 'Testing volume update requests: ', function() {

  before( async function() {
    const resp = await header.user1.post( `/volumes/user/${header.user1.username}/dinosaurs` );
    const json = await resp.json();
    assert.deepEqual( resp.status, 200 );
    volumeJson = json;
  } )

  after( async function() {
    const resp = await header.user1.delete( `/volumes/${volumeJson._id}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'prevents regular users from updating a volume', async function() {
    const resp = await header.user2.put( `/volumes/${volumeJson._id}`, {} );
    assert.deepEqual( resp.status, 403 );
  } )

  it( 'prevents updating a single volume with a bad id', async function() {
    const resp = await header.admin.put( `/volumes/BAD`, {} );
    assert.deepEqual( resp.statusText, 'Invalid ID format' );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'prevents updating a single volume that doesnt exist', async function() {
    const resp = await header.admin.put( `/volumes/123456789123456789123456`, {} );
    assert.deepEqual( resp.statusText, 'Resource does not exist' );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'allows an admin to update a single volume', async function() {
    const resp = await header.admin.put( `/volumes/${volumeJson._id}`, { name: 'dinosaurs2' } as IVolume<'client'> );
    const volume = await resp.json<IVolume<'client'>>();
    assert.deepEqual( resp.status, 200 );
    assert.deepEqual( volume.name, 'dinosaurs2' );
  } )
} )