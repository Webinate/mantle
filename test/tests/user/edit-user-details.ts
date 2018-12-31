import * as assert from 'assert';
import { } from 'mocha';
import header from '../header';
import { IUserEntry, IFileEntry } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
let user: IUserEntry<'expanded'>, file: IFileEntry<'expanded'>;

describe( 'Editting user data:', function() {

  before( async function() {
    const users = ControllerFactory.get( 'users' );
    user = await users.getUser( { username: header.user1.username } ) as IUserEntry<'expanded'>;

    const volumes = ControllerFactory.get( 'volumes' );
    const volume = await volumes.create( { name: 'test', user: user._id } );
    file = await uploadFileToVolume( 'img-a.png', volume, 'File A' ) as IFileEntry<'expanded'>;
  } )

  it( 'should error if user does not exist', async function() {
    const resp = await header.user1.put( `/api/users/123456789123456789123456`, { username: 'BAD' } as IUserEntry<'client'> );
    assert.deepEqual( resp.status, 404 );
  } )

  it( 'should error if a bad id was provided', async function() {
    const resp = await header.user1.put( `/api/users/BAD`, { username: 'BAD' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Invalid ID format` );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'should not allow a user to change its username directly', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { username: 'BAD!' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), 'You cannot set a username directly' );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its email directly', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { email: 'BAD!' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), 'You cannot set an email directly' );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its password directly', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { password: 'BAD!' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), 'You cannot set a password directly' );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its registerKey', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { registerKey: '' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Invalid value` );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its sessionId', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { sessionId: '' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Invalid value` );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its passwordTag', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { passwordTag: '' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Invalid value` );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a user to change its privileges', async function() {
    const resp = await header.user1.put( `/api/users/${user._id}`, { privileges: 0 } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Invalid value` );
    assert.deepEqual( resp.status, 400 );
  } )

  it( 'should not allow a regular user to change anothers data', async function() {
    const resp = await header.user2.put( `/api/users/${user._id}`, { avatar: '5' } as IUserEntry<'client'> );
    assert.deepEqual( resp.status, 403 );
  } )

  it( 'should allow a user to change authorized data', async function() {
    let resp = await header.user1.put( `/api/users/${user._id}`, {
      avatar: '5',
      meta: { foo: 'bar' }
    } as IUserEntry<'client'> );

    assert.deepEqual( resp.status, 200 );

    resp = await header.user1.get( `/api/users/${user.username}?verbose=true` );
    const data = await resp.json<IUserEntry<'client'>>()
    assert.deepEqual( data.avatar, '5' );
    assert.deepEqual( data.meta.foo, 'bar' );
  } )

  it( 'should allow an admin to change users data', async function() {
    let resp = await header.admin.put( `/api/users/${user._id}`, {
      avatar: '4',
      meta: { foo: 'foo' }
    } as IUserEntry<'client'> );

    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/users/${user.username}?verbose=true` );
    const data = await resp.json<IUserEntry<'client'>>()
    assert.deepEqual( data.avatar, '4' );
    assert.deepEqual( data.meta.foo, 'foo' );
  } )

  it( 'should handle a bad avatarFile update', async function() {
    let resp = await header.user1.put( `/api/users/${user._id}`, { avatarFile: 'NOT_ID' } as IUserEntry<'client'> );
    assert.deepEqual( decodeURIComponent( resp.statusText ), `Please use a valid ID for 'avatarFile'` );
    assert.deepEqual( resp.status, 500 );
  } )

  it( 'should allow setting avatarFile to an existing file', async function() {
    let resp = await header.user1.put( `/api/users/${user._id}`, { avatarFile: file._id } as IUserEntry<'client'> );
    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/users/${user.username}?verbose=true` );
    const data = await resp.json<IUserEntry<'client'>>();
    const avatarFile = data.avatarFile as IFileEntry<'client'>;
    assert.deepEqual( avatarFile._id, file._id );
    assert.deepEqual( avatarFile.user, file.user._id );
    assert.deepEqual( avatarFile.size, file.size );
  } )

  it( 'should allow setting avatarFile to null', async function() {
    let resp = await header.user1.put( `/api/users/${user._id}`, { avatarFile: null } as IUserEntry<'client'> );
    assert.deepEqual( resp.status, 200 );

    resp = await header.admin.get( `/api/users/${user.username}?verbose=true` );
    const data = await resp.json<IUserEntry<'client'>>()
    assert.deepEqual( data.avatarFile, null );
  } )
} )