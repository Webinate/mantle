import * as assert from 'assert';
import header from '../header';
import { REMOVE_USER, GET_USER } from '../../client/requests/users';
import { REGISTER, APPROVE_ACTIVATION } from '../../client/requests/auth';
import { RegisterInput, User } from '../../../src/index';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe('Testing registering a user', function() {
  before(async function() {
    await header.admin.graphql<boolean>(REMOVE_USER, { username: testUserName });
  });

  after(async function() {
    await header.admin.graphql<boolean>(REMOVE_USER, { username: testUserName });
  });

  it('should not register without username, password & email', async function() {
    const response = await header.guest.graphql<{ message: string }>(REGISTER, {
      token: <RegisterInput>{}
    });
    assert.deepEqual(
      response.errors![0].message,
      'Variable "$token" got invalid value {}; Field username of required type String! was not provided.'
    );
    assert.deepEqual(
      response.errors![1].message,
      'Variable "$token" got invalid value {}; Field password of required type String! was not provided.'
    );
    assert.deepEqual(
      response.errors![2].message,
      'Variable "$token" got invalid value {}; Field email of required type String! was not provided.'
    );
  });

  it('should not register with an incorrect email format', async function() {
    const { errors } = await header.guest.graphql<{ message: string }>(REGISTER, {
      token: <RegisterInput>{
        username: 'textok',
        password: 'textok',
        email: 'bademail'
      }
    });
    assert.deepEqual(errors![0].message, 'Validation error for email: Invalid email format');
  });

  it('should not register with bad characters in the username', async function() {
    const { errors } = await header.guest.graphql<{ message: string }>(REGISTER, {
      token: <RegisterInput>{
        username: '!�$%^^&&*()-=~#}{}',
        password: 'somepassword',
        email: 'FakeEmail@test.com'
      }
    });
    assert.deepEqual(errors![0].message, 'Please only use alpha numeric characters for your username');
  });

  it('should not register with existing username', async function() {
    const response = await header.guest.graphql<{ message: string }>(REGISTER, {
      token: <RegisterInput>{
        username: header.admin.username,
        password: 'FakePass',
        email: 'FakeEmail@test.com'
      }
    });

    assert.deepEqual(
      response.errors![0].message,
      'That username or email is already in use; please choose another or login.'
    );
  });

  it('should register with valid information', async function() {
    const resp = await header.guest.graphql<{ message: string }>(REGISTER, {
      token: <RegisterInput>{
        username: testUserName,
        password: 'Password',
        email: testUserEmail
      }
    });

    assert.deepEqual(resp.data.message, 'Please activate your account with the link sent to your email address');
  });

  it(`new registered user is not activated`, async function() {
    const resp = await header.admin.graphql<User>(GET_USER, { user: testUserName });
    assert.deepEqual(resp.data.isActivated, false);
  });

  it('did not approve activation as a guest', async function() {
    const { errors } = await header.guest.graphql<boolean>(APPROVE_ACTIVATION, {
      user: testUserName
    });
    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('did not approve activation as a regular user', async function() {
    const { errors } = await header.user1.graphql<boolean>(APPROVE_ACTIVATION, {
      user: testUserName
    });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('did allow an admin to activate ${testUserName}', async function() {
    const resp = await header.admin.graphql<boolean>(APPROVE_ACTIVATION, {
      user: testUserName
    });
    assert.deepEqual(resp.data, true);
  });

  it(`did approve ${testUserName}'s register key`, async function() {
    const resp = await header.admin.graphql<User>(GET_USER, { user: testUserName });
    assert.deepEqual(resp.data.isActivated, true);
  });
});
