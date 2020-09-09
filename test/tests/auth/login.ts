import * as assert from 'assert';
import header from '../header';
import { LOGIN } from '../../../src/graphql/client/requests/auth';
import { LoginInput, AuthResponse } from '../../../src/client-models';
import { IAdminUser } from '../../../src/types/config/properties/i-admin';

describe('Testing user logging in', function() {
  it('did not log in with empty credentials', async function() {
    const { errors } = await header.guest.graphql<AuthResponse>(LOGIN, { token: {} });
    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value {}; Field username of required type String! was not provided.'
    );
    assert.deepEqual(
      errors![1].message,
      'Variable "$token" got invalid value {}; Field password of required type String! was not provided.'
    );
  });

  it('did not log in with bad credentials', async function() {
    const { errors } = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{
        username: '"!%^',
        password: '"!%^'
      }
    });

    assert.deepEqual(errors![0].message, 'Please only use alpha numeric characters for your username');
  });

  it('did not log in with false credentials', async function() {
    const { errors } = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{
        username: 'GeorgeTheTwat',
        password: 'FakePass'
      }
    });

    assert.deepEqual(errors![0].message, 'The username or password is incorrect.');
  });

  it('did not log in with a valid username but invalid password', async function() {
    const { errors } = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{
        username: (header.config.adminUser as IAdminUser).username,
        password: 'FakePass'
      }
    });

    assert.deepEqual(errors![0].message, 'The username or password is incorrect.');
  });

  it('did log in with a valid username & valid password', async function() {
    const resp = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{
        username: (header.config.adminUser as IAdminUser).username,
        password: (header.config.adminUser as IAdminUser).password
      }
    });

    assert.deepEqual(resp.data.authenticated, true);
    header.admin.updateCookie(resp.response);
  });
});
