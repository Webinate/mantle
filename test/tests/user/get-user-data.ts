import * as assert from 'assert';
import header from '../header';
import { IAdminUser, IUserEntry } from '../../../src';
import { GET_USER_AS_ADMIN, GET_USER } from '../../../src/graphql/client/requests/users';

describe('Getting user data', function() {
  it('should allow admin access to its data', async function() {
    const { data: json } = await header.admin.graphql<IUserEntry<'expanded'>>(GET_USER_AS_ADMIN, {
      user: (header.config.adminUser as IAdminUser).username
    });

    assert(json._id);
    assert.deepEqual(json.email, (header.config.adminUser as IAdminUser).email);
    assert(json.lastLoggedIn);
    assert(json.registerKey === '');
    assert.deepEqual(json.username, (header.config.adminUser as IAdminUser).username);
    assert.deepEqual(json.privileges, 'super');
    assert(!json.passwordTag);
  });

  it('should get admin user data by email', async function() {
    const { data: json } = await header.admin.graphql<IUserEntry<'expanded'>>(GET_USER_AS_ADMIN, {
      user: (header.config.adminUser as IAdminUser).email
    });
    assert(json._id);
  });

  it('should not allow a guest to get user data with username', async function() {
    const { errors } = await header.guest.graphql<IUserEntry<'expanded'>>(GET_USER, {
      user: (header.config.adminUser as IAdminUser).email
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('should not allow a regular user access to sensitive data', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(GET_USER, {
      user: (header.config.adminUser as IAdminUser).username
    });

    assert.deepEqual(errors![0].message, `You do not have permission`);
  });
});
