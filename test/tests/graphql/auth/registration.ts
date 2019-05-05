import * as assert from 'assert';
import header from '../../header';

let testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe('[GQL] Testing registering a user', function() {
  before(async function() {
    await header.admin.graphql<boolean>(`mutation { removeUser(username: "${testUserName}") }`);
  });

  after(async function() {
    await header.admin.graphql<boolean>(`mutation { removeUser(username: "${testUserName}") }`);
  });

  it('[GQL] should not register with blank email', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "", password: "", email: "" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Please enter a valid username');
  });

  it('[GQL] should not register with existing username', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "${header.admin.username}", password: "FakePass", email: "" ) { message } }`
    );
    assert.deepEqual(
      resp.errors[0].message,
      'That username or email is already in use; please choose another or login.'
    );
  });

  it('[GQL] should not register with blank username', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "", password: "FakePass", email: "" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Please enter a valid username');
  });

  it('[GQL] should not register with blank password', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "sdfsdsdfsdfdf", password: "", email: "" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Password cannot be null or empty');
  });

  it('[GQL] should not register with bad characters', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "!�$%^^&&*()-=~#}{}", password: "!./<>;�$$%^&*()_+", email: "" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Please only use alpha numeric characters for your username');
  });

  it('[GQL] should not register with valid information but no email', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "${testUserName}", password: "Password", email: "" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Email cannot be null or empty');
  });

  it('[GQL] should not register with valid information but invalid email', async function() {
    const resp = await header.guest.graphql<{ message: string }>(
      `mutation { registerUser( username: "${testUserName}", password: "Password", email: "bad_email" ) { message } }`
    );
    assert.deepEqual(resp.errors[0].message, 'Please use a valid email address');
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

  it('[GQL] did not approve activation as a guest', async function() {
    const resp = await header.guest.graphql<boolean>(`mutation { approveActivation(username:"${testUserName}") }`);
    assert.deepEqual(resp.errors[0].message, 'Authentication Error');
  });

  it('[GQL] did not approve activation as a regular user', async function() {
    const resp = await header.user1.graphql<boolean>(`mutation { approveActivation(username:"${testUserName}") }`);
    assert.deepEqual(resp.errors[0].message, 'You do not have permission');
  });

  it('[GQL] did allow an admin to activate ${testUserName}', async function() {
    const resp = await header.admin.graphql<boolean>(`mutation { approveActivation(username:"${testUserName}") }`);
    assert.deepEqual(resp.data, true);
  });

  it(`[GQL] did approve ${testUserName}'s register key`, async function() {
    const resp = await header.admin.graphql<{ registerKey: string }>(
      `{ getUser(username:"${testUserName}", verbose:true) { registerKey } }`
    );
    assert(resp.data.registerKey === '');
  });
});
