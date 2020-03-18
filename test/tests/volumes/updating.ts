// import * as assert from 'assert';
// import header from '../header';
// import { IVolume } from '../../../src';

// let volumeJson: IVolume<'client'>;

// describe('Testing volume update requests: ', function() {
//   before(async function() {
//     const resp = await header.user1.post(`/volumes`, { name: 'dinosaurs' } as IVolume<'client'>);
//     const json = await resp.json();
//     assert.deepEqual(resp.status, 200);
//     volumeJson = json;
//   });

//   after(async function() {
//     const resp = await header.user1.delete(`/volumes/${volumeJson._id}`);
//     assert.deepEqual(resp.status, 204);
//   });

//   it('prevents regular users from updating a volume', async function() {
//     const resp = await header.user2.put(`/volumes/${volumeJson._id}`, {});
//     assert.deepEqual(resp.status, 403);
//   });

//   it('prevents updating a single volume with a bad id', async function() {
//     const resp = await header.admin.put(`/volumes/BAD`, {});
//     assert.deepEqual(decodeURIComponent(resp.statusText), 'Invalid ID format');
//     assert.deepEqual(resp.status, 500);
//   });

//   it('prevents updating a single volume that doesnt exist', async function() {
//     const resp = await header.admin.put(`/volumes/123456789123456789123456`, {});
//     assert.deepEqual(decodeURIComponent(resp.statusText), 'Volume does not exist');
//     assert.deepEqual(resp.status, 404);
//   });

//   it('should disallow a regular user to update memoryUsed', async function() {
//     const resp = await header.user1.put(`/volumes/${volumeJson._id}`, { memoryUsed: 0 } as IVolume<'client'>);
//     assert.deepEqual(resp.status, 403);
//   });

//   it('should disallow a regular user to update memoryAllocated', async function() {
//     const resp = await header.user1.put(`/volumes/${volumeJson._id}`, { memoryAllocated: 5000 } as IVolume<'client'>);
//     assert.deepEqual(resp.status, 403);
//   });

//   it('should allow an admin to update memoryAllocated & memoryUsed', async function() {
//     const resp = await header.admin.put(`/volumes/${volumeJson._id}`, {
//       memoryUsed: 0,
//       memoryAllocated: 5000
//     } as IVolume<'client'>);
//     assert.deepEqual(resp.status, 200);
//   });

//   it('allows an admin to update a single volume', async function() {
//     const resp = await header.admin.put(`/volumes/${volumeJson._id}`, {
//       name: 'dinosaurs2',
//       memoryUsed: 0,
//       memoryAllocated: 5000
//     } as IVolume<'client'>);
//     const volume = await resp.json<IVolume<'client'>>();
//     assert.deepEqual(resp.status, 200);
//     assert.deepEqual(volume.name, 'dinosaurs2');
//   });
// });
