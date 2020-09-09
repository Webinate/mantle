import * as assert from 'assert';
import header from '../header';
import { REMOVE_USER, GET_USER, GET_USER_AS_ADMIN } from '../../../src/graphql/client/requests/users';
import { REGISTER, LOGIN, RESEND_ACTIVATION } from '../../../src/graphql/client/requests/auth';
import { User, LoginInput, RegisterInput, AuthResponse } from '../../../src/client-models';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com',
  activationKey: string;

describe('Testing user activation', function() {
  before(async function() {
    await header.admin.graphql<{ removeUser: boolean }>(REMOVE_USER, {
      username: testUserName
    });
  });

  after(async function() {
    await header.admin.graphql<{ removeUser: boolean }>(REMOVE_USER, {
      username: testUserName
    });
  });

  it('should register with valid information', async function() {
    const resp = await header.guest.graphql<AuthResponse>(REGISTER, {
      token: <RegisterInput>{ username: testUserName, password: 'Password', email: testUserEmail }
    });
    assert.deepEqual(resp.data.message, 'Please activate your account with the link sent to your email address');
  });

  it(`user is not activated`, async function() {
    const resp = await header.admin.graphql<User>(GET_USER, { user: testUserName });
    assert.deepEqual(resp.data.isActivated, false);
  });

  it('did not log in with an activation code present', async function() {
    const resp = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{ username: testUserName, password: 'Password' }
    });

    assert.deepEqual(
      resp.errors![0].message,
      'Please authorise your account by clicking on the link that was sent to your email'
    );
  });

  it('did not resend an activation with an invalid user', async function() {
    const resp = await header.guest.graphql<boolean>(RESEND_ACTIVATION, {
      username: 'NONUSER5'
    });

    assert.deepEqual(resp.errors![0].message, 'No user exists with the specified details');
  });

  it('did resend an activation email with a valid user', async function() {
    const resp = await header.guest.graphql<boolean>(RESEND_ACTIVATION, {
      username: testUserName
    });
    assert.deepEqual(resp.data, true);
  });

  it('did not activate the account now that the activation key has changed', async function() {
    const resp = await header.guest.get(
      `/api/auth/activate-account?user=${testUserName}&key=${activationKey}`,
      undefined,
      {
        redirect: 'manual'
      }
    );
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it(`did not get the activation key for ${testUserName} as a guest`, async function() {
    let response = await header.guest.graphql<User>(GET_USER_AS_ADMIN, { user: testUserName });
    assert.deepEqual(response.errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it(`did not get the activation key for ${testUserName} as a registered user`, async function() {
    let response = await header.user1.graphql<User>(GET_USER_AS_ADMIN, { user: testUserName });
    assert.deepEqual(response.errors![0].message, `You do not have permission`);
  });

  it(`did get the renewed activation key for ${testUserName} as an admin`, async function() {
    const response = await header.admin.graphql<User>(GET_USER_AS_ADMIN, { user: testUserName });
    activationKey = response.data.registerKey;
    assert(activationKey);
  });

  it('did not activate with an invalid username', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=NONUSER`, undefined, { redirect: 'manual' });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('did not activate with an valid username and no key', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}`, undefined, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('did not activate with an valid username and invalid key', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}&key=123`, undefined, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('did activate with a valid username and key', async function() {
    const resp = await header.guest.get(
      `/api/auth/activate-account?user=${testUserName}&key=${activationKey}`,
      undefined,
      {
        redirect: 'manual'
      }
    );
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('success') !== -1);
  });

  it('did log in with valid details and an activated account', async function() {
    const {
      data: { authenticated }
    } = await header.guest.graphql<AuthResponse>(LOGIN, {
      token: <LoginInput>{
        username: testUserName,
        password: 'Password'
      }
    });
    assert(authenticated);
  });
});
