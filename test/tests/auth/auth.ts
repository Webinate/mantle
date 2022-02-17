import * as assert from 'assert';
import header from '../header';
import { AUTHENTICATED } from '../../client/requests/auth';
import { AuthResponse } from '../../../src/index';
import { IAdminUser } from '../../../src/types/config/properties/i-admin';

describe('Checking basic authentication', function() {
  it('guest should not be logged in', async function() {
    const resp = await header.guest.graphql<AuthResponse>(AUTHENTICATED);
    const auth = resp.data;

    assert(auth.authenticated === false);
    assert.deepEqual(auth.message, 'User is not authenticated');
  });

  it('admin should be logged in', async function() {
    const resp = await header.admin.graphql<AuthResponse>(AUTHENTICATED);
    const auth = resp.data;

    assert(auth.authenticated);
    assert.deepEqual(auth.message, 'User is authenticated');
    assert(auth.user!._id);
    assert(auth.user!.email, (header.config.adminUser as IAdminUser).email);
    assert(auth.user!.lastLoggedIn);
    assert(auth.user!.createdOn);
    assert.deepEqual(auth.user!.username, (header.config.adminUser as IAdminUser).username);
    assert.deepEqual(auth.user!.privileges, null);
  });
});
