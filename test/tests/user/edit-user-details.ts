import * as assert from 'assert';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { EDIT_USER } from '../../../src/graphql/client/requests/users';
import { UpdateUserInput, UserPrivilege, User } from '../../../src/client-models';
import { IFileEntry } from '../../../src/types/models/i-file-entry';
import { IVolume } from '../../../src/types/models/i-volume-entry';
import { IUserEntry } from '../../../src/types/models/i-user-entry';

let user: IUserEntry<'server'>, admin: IUserEntry<'server'>, volume: IVolume<'server'>, file: IFileEntry<'server'>;

describe('Editting user data:', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    user = (await users.getUser({ username: header.user1.username })) as IUserEntry<'server'>;
    admin = (await users.getUser({ username: header.admin.username })) as IUserEntry<'server'>;

    const volumes = ControllerFactory.get('volumes');
    volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'server'>;
    file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'server'>;
  });

  after(async function() {
    const volumes = ControllerFactory.get('volumes');
    await volumes.remove({ _id: volume._id });
  });

  it('should error if user does not exist', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: {
        _id: '123456789123456789123456'
      } as UpdateUserInput
    });

    assert.deepEqual(errors![0].message, 'User does not exist');
  });

  it('should error if a bad id was provided', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: 'BAD'
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "BAD" at "token._id"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('should not allow a user to change its username directly', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        username: 'BAD!'
      }
    });

    assert.deepEqual(errors![0].message, 'You cannot set a username directly');
  });

  it('should not allow a user to change its email directly', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        email: 'BAD!'
      }
    });

    assert.deepEqual(errors![0].message, 'Argument Validation Error');
  });

  it('should allow an admin to change an email directly', async function() {
    const {
      data: { email }
    } = await header.admin.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        email: header.user1.email
      }
    });

    assert.deepEqual(email, header.user1.email);
  });

  // it('should not allow a user to change its password directly', async function() {
  //   const { errors } = await header.user1.graphql<User>(EDIT_USER, {
  //     token: <UpdateUserInput>({
  //       _id: user._id,
  //       email: header.user1.email
  //     })
  //   });

  //   {
  //     id: user._id,
  //     token: { password: 'BAD!' } as IUserEntry<'client'>
  //   });

  //   assert.deepEqual(errors[0].message, 'You cannot set a password directly');
  // });

  // it('should not allow a user to change its registerKey', async function() {
  //   const { errors } = await header.user1.graphql<User>(EDIT_USER, {
  //     id: user._id,
  //     token: { registerKey: '' } as IUserEntry<'client'>
  //   });

  //   assert.deepEqual(errors[0].message, 'Invalid value');
  // });

  // it('should not allow a user to change its sessionId', async function() {
  //   const { errors } = await header.user1.graphql<User>(EDIT_USER, {
  //     id: user._id,
  //     token: { sessionId: '' } as IUserEntry<'client'>
  //   });

  //   assert.deepEqual(
  //     errors[0].message,
  //     'Variable "$token" got invalid value { sessionId: "" }; Field "sessionId" is not defined by type UserInput.'
  //   );
  // });

  // it('should not allow a user to change its passwordTag', async function() {
  //   const { errors } = await header.user1.graphql<User>(EDIT_USER, {
  //     id: user._id,
  //     token: { passwordTag: '' } as IUserEntry<'client'>
  //   });

  //   assert.deepEqual(errors[0].message, 'Invalid value');
  // });

  it('should not allow a user to change its privileges', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        privileges: 'Gobshite' as any
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "Gobshite" at "token.privileges"; Expected type UserPrivilege.'
    );
  });

  it('should not allow a regular user to change anothers data', async function() {
    const { errors } = await header.user2.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatar: '5'
      }
    });

    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('should allow a user to change authorized data', async function() {
    const { data } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatar: '5',
        meta: { foo: 'bar' }
      }
    });

    assert.deepEqual(data.avatar, '5');
    assert.deepEqual(data.meta.foo, 'bar');
  });

  it('should allow an admin to change users data', async function() {
    const { data } = await header.admin.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatar: '4',
        meta: { foo: 'foo' }
      }
    });

    assert.deepEqual(data.avatar, '4');
    assert.deepEqual(data.meta.foo, 'foo');
  });

  it('should handle a bad avatarFile update', async function() {
    const { errors } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatarFile: 'NOT_ID'
      }
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "NOT_ID" at "token.avatarFile"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('should allow setting avatarFile to an existing file', async function() {
    const {
      data: { avatarFile }
    } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatarFile: file._id
      }
    });

    assert.deepEqual(avatarFile!._id, file._id.toString());
  });

  it('should allow setting avatarFile to null', async function() {
    const {
      data: { avatarFile }
    } = await header.user1.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: user._id,
        avatarFile: null
      }
    });

    assert.deepEqual(avatarFile, null);
  });

  it('should not allow an admin to set a priviledge of itself less than super admin', async function() {
    const { errors } = await header.admin.graphql<User>(EDIT_USER, {
      token: <UpdateUserInput>{
        _id: admin._id,
        privileges: UserPrivilege.Admin
      }
    });

    assert.deepEqual(errors![0].message, 'You cannot set a super admin level to less than super admin');
  });
});
