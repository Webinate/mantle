import * as assert from 'assert';
import header from '../../header';
import { IAdminUser, IAuthenticationResponse } from '../../../../src';
import { userFragment } from '../fragments';

describe('[GQL] Checking basic authentication', function() {
  it('[GQL] guest should not be logged in', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(`{ authenticated { authenticated, message } }`);
    const auth = resp.data;

    assert(auth.authenticated === false);
    assert.deepEqual(auth.message, 'User is not authenticated');
  });

  it('[GQL] admin should be logged in', async function() {
    const resp = await header.admin.graphql<IAuthenticationResponse>(
      `{ authenticated { authenticated, message, user { ...UserFields } } } ${userFragment}`
    );
    const auth = resp.data;

    assert(auth.authenticated);
    assert.deepEqual(auth.message, 'User is authenticated');
    assert(auth.user._id);
    assert(auth.user.email === null);
    assert(auth.user.lastLoggedIn);
    assert(auth.user.createdOn);
    assert(auth.user.password === null);
    assert(auth.user.registerKey === null);
    assert(auth.user.sessionId === null);
    assert.deepEqual(auth.user.username, (header.config.adminUser as IAdminUser).username);
    assert.deepEqual(auth.user.privileges, 'super');
    assert(auth.user.passwordTag === null);
  });

  it('[GQL] admin should be authenticated and pass verbose details', async function() {
    const resp = await header.admin.graphql<IAuthenticationResponse>(
      `{ authenticated(verbose: true) { authenticated, message, user { ...UserFields } } } ${userFragment}`
    );
    const auth = resp.data;

    assert(auth.authenticated);
    assert.deepEqual(auth.message, 'User is authenticated');
    assert(auth.user._id);
    assert.deepEqual(auth.user.email, (header.config.adminUser as IAdminUser).email);
    assert(auth.user.lastLoggedIn);
    assert(auth.user.createdOn);
    assert(auth.user.password);
    assert.deepEqual(auth.user.registerKey, '');
    assert(auth.user.sessionId);
    assert.deepEqual(auth.user.username, (header.config.adminUser as IAdminUser).username);
    assert.deepEqual(auth.user.privileges, 'super');
    assert(auth.user.passwordTag === '');
  });
});
