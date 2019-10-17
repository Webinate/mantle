import * as assert from 'assert';
import header from '../../header';
import { IUserEntry, IFileEntry, IVolume } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { uploadFileToVolume } from '../../file';
import { EDIT_USER } from '../queries/users';
let user: IUserEntry<'expanded'>,
  volume: IVolume<'expanded'>,
  admin: IUserEntry<'expanded'>,
  file: IFileEntry<'expanded'>;

describe('[GQL] Editting user data:', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    user = (await users.getUser({ username: header.user1.username })) as IUserEntry<'expanded'>;
    admin = (await users.getUser({ username: header.admin.username })) as IUserEntry<'expanded'>;

    const volumes = ControllerFactory.get('volumes');
    volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'expanded'>;
    file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'expanded'>;
  });

  after(async function() {
    const volumes = ControllerFactory.get('volumes');
    await volumes.remove({ _id: volume._id });
  });

  it('should error if user does not exist', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: '123456789123456789123456',
      token: {} as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'User does not exist');
  });

  it('should error if a bad id was provided', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: 'BAD',
      token: {} as IUserEntry<'client'>
    });

    assert.deepEqual(
      errors[0].message,
      'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('should not allow a user to change its username directly', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { username: 'BAD!' } as IUserEntry<'client'>
    });

    assert.deepEqual(
      errors[0].message,
      'Variable "$token" got invalid value { username: "BAD!" }; Field "username" is not defined by type UserInput.'
    );
  });

  it('should not allow a user to change its email directly', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { email: 'BAD!' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'You cannot set an email directly');
  });

  it('should allow an admin to change an email directly', async function() {
    const {
      data: { email }
    } = await header.admin.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { email: header.user1.email } as IUserEntry<'client'>
    });

    assert.deepEqual(email, header.user1.email);
  });

  it('should not allow a user to change its password directly', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { password: 'BAD!' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'You cannot set a password directly');
  });

  it('should not allow a user to change its registerKey', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { registerKey: '' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'Invalid value');
  });

  it('should not allow a user to change its sessionId', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { sessionId: '' } as IUserEntry<'client'>
    });

    assert.deepEqual(
      errors[0].message,
      'Variable "$token" got invalid value { sessionId: "" }; Field "sessionId" is not defined by type UserInput.'
    );
  });

  it('should not allow a user to change its passwordTag', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { passwordTag: '' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'Invalid value');
  });

  it('should not allow a user to change its privileges', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { privileges: 'Gobshite' }
    });

    assert.deepEqual(
      errors[0].message,
      'Variable "$token" got invalid value { privileges: "Gobshite" }; Expected type UserPriviledges at value.privileges.'
    );
  });

  it('should not allow a regular user to change anothers data', async function() {
    const { errors } = await header.user2.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatar: '5' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });

  it('should allow a user to change authorized data', async function() {
    const { data } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatar: '5', meta: { foo: 'bar' } } as IUserEntry<'client'>
    });

    assert.deepEqual(data.avatar, '5');
    assert.deepEqual(data.meta.foo, 'bar');
  });

  it('should allow an admin to change users data', async function() {
    const { data } = await header.admin.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatar: '4', meta: { foo: 'foo' } } as IUserEntry<'client'>
    });

    assert.deepEqual(data.avatar, '4');
    assert.deepEqual(data.meta.foo, 'foo');
  });

  it('should handle a bad avatarFile update', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatarFile: 'NOT_ID' } as IUserEntry<'client'>
    });

    assert.deepEqual(
      errors[0].message,
      'Variable "$token" got invalid value { avatarFile: "NOT_ID" }; Expected type ObjectId at value.avatarFile; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('should allow setting avatarFile to an existing file', async function() {
    const {
      data: { avatarFile }
    } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatarFile: file._id } as IUserEntry<'client'>
    });

    assert.deepEqual(avatarFile._id, file._id);
  });

  it('should allow setting avatarFile to null', async function() {
    const {
      data: { avatarFile }
    } = await header.user1.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatarFile: null } as IUserEntry<'client'>
    });

    assert.deepEqual(avatarFile, null);
  });

  it('should not allow an admin to set a priviledge of itself less than super admin', async function() {
    const { errors } = await header.admin.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: admin._id,
      token: { privileges: 'admin' } as IUserEntry<'client'>
    });

    assert.deepEqual(errors[0].message, 'You cannot set a super admin level to less than super admin');
  });
});
