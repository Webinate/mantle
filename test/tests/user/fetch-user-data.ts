import * as assert from 'assert';
import header from '../header';
import { GET_USERS, GET_USER } from '../../client/requests/users';
import gql from '../../client/gql';
import { USER_FIELDS } from '../../client/fragments/user-fields';
import { PaginatedUserResponse, User } from '../../../src/index';

let numUsers: number;

const query1 = gql`
  query GET_USERS_WITH_EXCEPTION {
    users {
      data {
        registerKey
        privileges
        email
      }
    }
  }
`;
const query2 = gql`
  query GET_USERS_EMAILS {
    users {
      data {
        email
      }
    }
  }
`;
const query3 = gql`
  query GET_USERS_EMAILS_AND_KEYS {
    users {
      data {
        email
        registerKey
        privileges
      }
    }
  }
`;

describe('Testing fetching users', function() {
  this.timeout(60000);

  it('did get the number of users before the tests begin', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);
    numUsers = count;
  });

  it('did not allow a regular user to access the admin user details', async function() {
    const { errors } = await header.user1.graphql<User>(GET_USER, {
      user: header.admin.username,
      verbose: true
    });

    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('did not allow a regular user to access another user details', async function() {
    const { errors } = await header.user2.graphql<User>(GET_USER, {
      user: header.user1.username,
      verbose: true
    });

    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('did get regular users own data', async function() {
    const query = gql`
      query GET_USER_WITH_EMAIL($user: String!) {
        user(user: $user) {
          ...UserFields
          email
        }
      }
      ${USER_FIELDS}
    `;

    const { data } = await header.user1.graphql<User>(query, {
      user: header.user1.username,
      verbose: true
    });

    assert(data._id);
    assert.deepEqual(data.email, header.user1.email);
    assert(data.lastLoggedIn);
    assert(!data.registerKey);
    assert(data.avatar !== '');
    assert.deepEqual(data.avatarFile, null);
    assert.deepEqual(data.username, header.user1.username);

    // Should not see priviledges
    assert.deepEqual(data.privileges, undefined);
  });

  it('did get user page information', async function() {
    const {
      data: { count, index, limit }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);

    assert(count > 0);
    assert.deepEqual(index, 0);
    assert.deepEqual(limit, 10);
  });

  it('did get client driven page information from the URL', async function() {
    const {
      data: { index, limit }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS, { limit: 20, index: 1 });

    assert.deepEqual(index, 1);
    assert.deepEqual(limit, 20);
  });

  it('did have the same number of users as before the tests started', async function() {
    const {
      data: { count }
    } = await header.admin.graphql<PaginatedUserResponse>(GET_USERS);
    assert.deepEqual(numUsers, count);
  });

  it('throws an error if a regular user tries to key key data in a list', async function() {
    const resp = await header.user1.graphql<PaginatedUserResponse>(query1);
    assert.deepEqual(resp.errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('does give regular users access to user lists but with email hidden', async function() {
    const resp = await header.user1.graphql<PaginatedUserResponse>(query2);
    const data = resp.data.data;
    assert.deepEqual(data[0].email, null);
  });

  it('does allow admin users access to sensitive user data for a getUsers call', async function() {
    const resp = await header.admin.graphql<PaginatedUserResponse>(query3);
    const data = resp.data.data;
    assert.notDeepEqual(data[0].email, null);
    assert.notDeepEqual(data[0].registerKey, null);
    assert.notDeepEqual(data[0].privileges, null);
  });
});
