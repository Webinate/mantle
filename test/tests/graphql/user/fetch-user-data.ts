// import * as assert from 'assert';
// import header from '../../header';
// import { IUserEntry, Page } from '../../../../src';
// import { GET_USERS, GET_USER } from '../../../../src/graphql/client/requests/users';

// let numUsers: number;

// describe('Testing fetching users', function() {
//   it('did get the number of users before the tests begin', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS);
//     numUsers = count;
//   });

//   it('did not allow a regular user to access the admin user details', async function() {
//     const { errors } = await header.user1.graphql<IUserEntry<'expanded'>>(GET_USER, {
//       username: header.admin.username,
//       verbose: true
//     });

//     assert.deepEqual(errors[0].message, 'You do not have permission');
//   });

//   it('did not allow a regular user to access another user details', async function() {
//     const { errors } = await header.user2.graphql<IUserEntry<'expanded'>>(GET_USER, {
//       username: header.user1.username,
//       verbose: true
//     });

//     assert.deepEqual(errors[0].message, 'You do not have permission');
//   });

//   it('did get regular users own data', async function() {
//     const { data } = await header.user1.graphql<IUserEntry<'expanded'>>(GET_USER, {
//       username: header.user1.username,
//       verbose: true
//     });

//     assert(data._id);
//     assert.deepEqual(data.email, header.user1.email);
//     assert(data.lastLoggedIn);
//     assert(data.password);
//     assert(data.registerKey === '');
//     assert(data.sessionId);
//     assert(data.passwordTag === '');
//     assert(data.avatar !== '');
//     assert.deepEqual(data.avatarFile, null);
//     assert.deepEqual(data.username, header.user1.username);
//     assert.deepEqual(data.privileges, 'regular');
//   });

//   it('did get user page information', async function() {
//     const {
//       data: { count, index, limit }
//     } = await header.admin.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS);

//     assert(count > 0);
//     assert.deepEqual(index, 0);
//     assert.deepEqual(limit, 10);
//   });

//   it('did get client driven page information from the URL', async function() {
//     const {
//       data: { index, limit }
//     } = await header.admin.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS, { limit: 20, index: 1 });

//     assert.deepEqual(index, 1);
//     assert.deepEqual(limit, 20);
//   });

//   it('did have the same number of users as before the tests started', async function() {
//     const {
//       data: { count }
//     } = await header.admin.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS);
//     assert.deepEqual(numUsers, count);
//   });

//   it('does not give regular users access to sensitive user data', async function() {
//     const {
//       data: { count, data }
//     } = await header.user1.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS, { verbose: true });

//     assert.deepEqual(data[0].email, null);
//     assert.deepEqual(data[0].password, null);
//     assert.deepEqual(data[0].passwordTag, null);
//     assert.deepEqual(data[0].registerKey, null);
//     assert.deepEqual(data[0].privileges, null);
//   });

//   it('does allow admin users access to sensitive user data for a getUsers call', async function() {
//     const {
//       data: { data }
//     } = await header.admin.graphql<Page<IUserEntry<'expanded'>>>(GET_USERS, { verbose: true });

//     assert.notDeepEqual(data[0].email, null);
//     assert.notDeepEqual(data[0].password, null);
//     assert.notDeepEqual(data[0].passwordTag, null);
//     assert.notDeepEqual(data[0].registerKey, null);
//     assert.notDeepEqual(data[0].privileges, null);
//   });
// });
