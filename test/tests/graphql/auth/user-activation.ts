import * as assert from 'assert';
import header from '../../header';
import { IAuthenticationResponse, IUserEntry } from '../../../../src';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com',
  activationKey: string;

describe('[GQL] Testing user activation', function() {
  before(async function() {
    await header.admin.graphql<{ removeUser: boolean }>(`mutation { removeUser(username: "${testUserName}") }`);
  });

  after(async function() {
    await header.admin.graphql<{ removeUser: boolean }>(`mutation { removeUser(username: "${testUserName}") }`);
  });

  it('[GQL] should register with valid information', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "${testUserName}", password: "Password", email: "${testUserEmail}" ) { message } }`
    );
    assert.deepEqual(resp.data.message, 'Please activate your account with the link sent to your email address');
  });

  it(`[GQL] did create an activation key for ${testUserName}`, async function() {
    const resp = await header.admin.graphql<{ registerKey: string }>(
      `{ getUser(username:"${testUserName}", verbose:true) { registerKey } }`
    );
    assert(resp.data.registerKey !== '');
  });

  it('[GQL] did not log in with an activation code present', async function() {
    const resp = await header.guest.graphql<IAuthenticationResponse>(
      `mutation { login(username: "${testUserName}", password: "Password") { authenticated, message } }`
    );

    assert.deepEqual(
      resp.errors[0].message,
      'Please authorise your account by clicking on the link that was sent to your email'
    );
  });

  it('[GQL] did not resend an activation with an invalid user', async function() {
    const resp = await header.guest.graphql<boolean>(`mutation { resendActivation(username: "NONUSER5") }`);

    assert.deepEqual(resp.errors[0].message, 'No user exists with the specified details');
  });

  it('[GQL] did resend an activation email with a valid user', async function() {
    const resp = await header.guest.graphql<boolean>(`mutation { resendActivation(username: "${testUserName}") }`);
    assert.deepEqual(resp.data, true);
  });

  it('[GQL] did not activate the account now that the activation key has changed', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}&key=${activationKey}`, null, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it(`[GQL] did get the renewed activation key for ${testUserName}`, async function() {
    const {
      data: { registerKey }
    } = await header.admin.graphql<IUserEntry<'expanded'>>(
      `{ getUser( username: "${testUserName}", verbose: true ) { registerKey } }`
    );
    activationKey = registerKey;
    assert(registerKey);
  });

  it('[GQL] did not activate with an invalid username', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=NONUSER`, null, { redirect: 'manual' });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('[GQL] did not activate with an valid username and no key', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}`, null, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('[GQL] did not activate with an valid username and invalid key', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}&key=123`, null, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('error') !== -1);
  });

  it('[GQL] did activate with a valid username and key', async function() {
    const resp = await header.guest.get(`/api/auth/activate-account?user=${testUserName}&key=${activationKey}`, null, {
      redirect: 'manual'
    });
    assert.deepEqual(resp.status, 302);
    assert.deepEqual(resp.headers.get('content-type'), 'text/plain; charset=utf-8');
    assert(resp.headers.get('location').indexOf('success') !== -1);
  });

  it('[GQL] did log in with valid details and an activated account', async function() {
    const {
      data: { authenticated }
    } = await header.admin.graphql<IAuthenticationResponse>(
      `mutation { login( username: "${testUserName}", password: "Password") { authenticated } }`
    );
    assert(authenticated);
  });
});
