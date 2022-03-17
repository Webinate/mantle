import * as assert from 'assert';
import header from '../header';
import Agent from '../agent';
import { REMOVE_USER } from '../../client/requests/users';
import { AUTHENTICATED, LOGOUT } from '../../client/requests/auth';

let agent: Agent,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe('Testing user logging in', function() {
  before(async function() {
    await header.guest.graphql<boolean>(REMOVE_USER, { username: testUserName });
  });

  after(async function() {
    await header.guest.graphql<boolean>(REMOVE_USER, { username: testUserName });
  });

  it(`did create & login regular user ${testUserName} with valid details`, async function() {
    const newAgent = await header.createUser(testUserName, 'password', testUserEmail);
    agent = newAgent;
  });

  it('user should be logged in', async function() {
    const resp = await agent.graphql<{ authenticated: boolean }>(AUTHENTICATED);
    assert.deepEqual(resp.data.authenticated, true);
  });

  it('should log out', async function() {
    const resp = await agent.graphql<boolean>(LOGOUT);
    assert.deepEqual(resp.data, true);
  });

  it('user should be logged out', async function() {
    const resp = await agent.graphql<{ authenticated: boolean }>(AUTHENTICATED);
    assert.deepEqual(resp.data.authenticated, false);
  });
});
