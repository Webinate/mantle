import * as assert from 'assert';
import Agent from '../agent';
import header from '../header';
import { randomString } from '../utils';
import { REMOVE_USER, GET_USERS, CREATE_USER } from '../../../src/graphql/client/requests/users';
import { PaginatedUserResponse, AddUserInput, User } from '../../../src/index';

let numUsers: number,
  agent: Agent,
  testUserName = `test${randomString(6)}`,
  testUserEmail = `test${randomString(6)}@fancy.com`;

describe('Testing deleting users', function() {
  it('did get the number of users', async function() {
    const resp = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);
    numUsers = resp.data.count;
  });

  it('did not allow a regular user to remove another user', async function() {
    const { errors } = await header.user1.graphql<boolean>(REMOVE_USER, {
      username: header.user2.username
    });
    assert.deepEqual(errors![0].message, `You do not have permission`);
  });

  it(`did create & login regular user ${testUserName} with valid details`, async function() {
    const { data: newUser } = await header.admin.graphql<User>(CREATE_USER, {
      token: {
        username: testUserName,
        password: 'password',
        email: testUserEmail,
        privileges: 'regular'
      } as AddUserInput
    });

    assert(newUser._id);

    const newAgent = await header.createUser(testUserName, 'password', testUserEmail);
    agent = newAgent;
  });

  it('did increment the number of users', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);

    assert(count - 1 === numUsers);
  });

  it('did allow the regular user to delete its own account', async function() {
    const response = await agent.graphql<boolean>(REMOVE_USER, {
      username: testUserName
    });

    assert(response.data);
  });

  it('did have the same number of users as before the tests started', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);

    assert(count === numUsers);
  });
});
