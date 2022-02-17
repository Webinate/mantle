import * as assert from 'assert';
import header from '../header';
import { CREATE_USER, GET_USER_AS_ADMIN } from '../../client/requests/users';
import controllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import { AddUserInput, User } from '../../../src/index';

let testUserName = `test${randomString(6)}`,
  testUserEmail = `test${randomString(6)}@fancy.com`;

describe('Testing creating a user', function() {
  after(async function() {
    const resp = await controllerFactory.get('users').remove(testUserName);
    assert(resp);
  });

  it('did not create a new user without a valid email', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: '',
        password: '',
        email: ''
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'Validation error for email: email must be an email');
  });

  it('did not create a new user without a username & password', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: '',
        password: '',
        email: 'test@test.com'
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'Username cannot be empty');
  });

  it('did not create a new user without a password', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: '',
        email: testUserEmail
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'Password cannot be empty');
  });

  it('did not create a new user with invalid characters', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: 'test__test',
        password: 'password',
        email: testUserEmail
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'Username must be alphanumeric');
  });

  it('did not create a new user with invalid privilege', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: ({
        username: testUserName,
        password: 'password',
        email: testUserEmail,
        privileges: 'fake_permission'
      } as any) as AddUserInput
    });

    assert.deepEqual(
      errors![0].message,
      `Variable "$token" got invalid value "fake_permission" at "token.privileges"; Expected type UserPrivilege.`
    );
  });

  it('did not create a new user with an existing username', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: header.admin.username,
        password: 'password',
        email: testUserEmail,
        privileges: 'admin'
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'A user with that name or email already exists');
  });

  it('did not create a new user with an existing email', async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: 'password',
        email: header.admin.email,
        privileges: 'admin'
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'A user with that name or email already exists');
  });

  it(`did not create user ${testUserName} with super admin privileges`, async function() {
    const { errors } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: 'password',
        email: testUserEmail,
        privileges: 'super'
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, 'You cannot create a user with super admin permissions');
  });

  it('did not create a new user as a regular user', async function() {
    const { errors } = await header.user1.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: 'password',
        email: testUserEmail,
        privileges: 'super'
      } as AddUserInput
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it(`did create regular user ${testUserName} with valid details`, async function() {
    const { data: newUser } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: 'password',
        email: testUserEmail,
        privileges: 'regular'
      } as AddUserInput
    });

    assert.deepEqual(newUser.username, testUserName);
    assert.deepEqual(newUser.email, testUserEmail);
    assert(newUser._id);
  });

  it('did not create an activation key for george', async function() {
    const { data: newUser } = await header.admin.graphql<User>(GET_USER_AS_ADMIN, {
      user: testUserName
    });

    assert.deepEqual(newUser.registerKey, '');
  });
});
