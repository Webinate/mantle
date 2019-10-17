import * as assert from 'assert';
import header from '../../header';
import { IAdminUser, IUserEntry, Page } from '../../../../src';
import { GET_USER } from '../queries/users';
import { verbose } from 'winston';

describe('[GQL] Getting user data', function() {
  it('should allow admin access to its data', async function() {
    const { data: json } = await header.admin.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: (header.config.adminUser as IAdminUser).username
    });

    assert(json._id);
    assert.deepEqual(json.email, (header.config.adminUser as IAdminUser).email);
    assert(json.lastLoggedIn);
    assert(json.password);
    assert(json.registerKey === '');
    assert(json.sessionId);
    assert.deepEqual(json.username, (header.config.adminUser as IAdminUser).username);
    assert.deepEqual(json.privileges, 'super');
    assert(json.passwordTag === '');
  });

  it('should get admin user data by email', async function() {
    const { data: json } = await header.admin.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: (header.config.adminUser as IAdminUser).email
    });
    assert(json._id);
  });

  it('should not allow a guest to get user data with username', async function() {
    const { errors } = await header.guest.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: (header.config.adminUser as IAdminUser).email
    });

    assert.deepEqual(errors[0].message, 'Authentication Error');
  });

  it('should not allow a regular user access to sensitive data', async function() {
    const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: (header.config.adminUser as IAdminUser).username
    });

    assert.deepEqual(errors[0].message, 'You do not have permission');
  });
});
