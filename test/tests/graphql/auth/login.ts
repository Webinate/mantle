import * as assert from 'assert';
import header from '../../header';
import { IAdminUser, IAuthenticationResponse } from '../../../../src';

describe('[GQL] Testing user logging in', function() {
  it('[GQL] did not log in with empty credentials', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(`mutation { login { authenticated, message } }`);
    assert.deepEqual(
      resp.errors[0].message,
      'Field "login" argument "username" of type "String!" is required but not provided.'
    );
  });

  it('[GQL] did not log in with empty password', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "!%^") { authenticated, message } }`
    );
    assert.deepEqual(
      resp.errors[0].message,
      'Field "login" argument "password" of type "String!" is required but not provided.'
    );
  });

  it('[GQL] did not log in with bad credentials', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "!%^", password: "!%^") { authenticated, message } }`
    );

    assert.deepEqual(resp.errors[0].message, 'Please only use alpha numeric characters for your username');
  });

  it('[GQL] did not log in with false credentials', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "GeorgeTheTwat", password: "FakePass") { authenticated, message } }`
    );

    assert.deepEqual(resp.errors[0].message, 'The username or password is incorrect.');
  });

  it('[GQL] did not log in with a valid username but invalid password', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "${
        (header.config.adminUser as IAdminUser).username
      }", password: "FakePass") { authenticated, message } }`
    );

    assert.deepEqual(resp.errors[0].message, 'The username or password is incorrect.');
  });

  it('[GQL] did log in with a valid username & valid password', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "${(header.config.adminUser as IAdminUser).username}", password: "${
        (header.config.adminUser as IAdminUser).password
      }") { authenticated, message } }`
    );

    assert.deepEqual(resp.data.authenticated, true);
    header.admin.updateCookie(resp.response);
  });
});
