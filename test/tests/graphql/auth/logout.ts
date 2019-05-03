import * as assert from 'assert';
import header from '../../header';
import Agent from '../../agent';

let agent: Agent,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe('[GQL] Testing user logging in', function() {
  before(async function() {
    await header.guest.graphql<boolean>(
      `mutation { removeUser(username: "${testUserName}") { authenticated, message } }`
    );
  });

  after(async function() {
    await header.guest.graphql<boolean>(
      `mutation { removeUser(username: "${testUserName}") { authenticated, message } }`
    );
  });

  it(`[GQL] did create & login regular user ${testUserName} with valid details`, async function() {
    const newAgent = await header.createUser(testUserName, 'password', testUserEmail);
    agent = newAgent;
  });

  it('[GQL] user should be logged in', async function() {
    const resp = await agent.graphql<{ authenticated: boolean }>(`{ authenticated { authenticated } }`);
    assert.deepEqual(resp.data.authenticated, true);
  });

  it('[GQL] should log out', async function() {
    const resp = await agent.graphql<boolean>(`mutation { logout }`);
    assert.deepEqual(resp.data, true);
  });

  it('[GQL] user should be logged out', async function() {
    const resp = await agent.graphql<{ authenticated: boolean }>(`{ authenticated { authenticated } }`);
    assert.deepEqual(resp.data.authenticated, false);
  });
});
