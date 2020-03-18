// import * as assert from 'assert';
// import header from '../header';
// import { Page, IVolume } from '../../../src';

// let volume: string;

// describe('Testing volume deletion', function() {
//   it('regular user did create a volume dinosaurs', async function() {
//     const resp = await header.user1.post(`/volumes`, { name: 'dinosaurs' } as IVolume<'client'>);
//     const json = await resp.json();
//     assert.deepEqual(resp.status, 200);
//     volume = json._id;
//   });

//   it('regular user did not delete a volume that does not exist', async function() {
//     const resp = await header.user1.delete(`/volumes/123456789012345678901234`);
//     const json = await resp.json();
//     assert.deepEqual(resp.status, 500);
//     assert.deepEqual(json.message, 'A volume with that ID does not exist');
//   });

//   it('regular user did not delete a volume that does not have a valid id', async function() {
//     const resp = await header.user1.delete(`/volumes/badID`);
//     const json = await resp.json();
//     assert.deepEqual(resp.status, 500);
//     assert.deepEqual(json.message, 'Please use a valid object id');
//   });

//   it('regular user has 1 volume', async function() {
//     const resp = await header.user1.get(`/volumes`);
//     const json: Page<IVolume<'client'>> = await resp.json();
//     assert.deepEqual(resp.status, 200);
//     assert(json.data.length === 1);
//   });

//   it('regular user did remove the volumes dinosaurs', async function() {
//     const resp = await header.user1.delete(`/volumes/${volume}`);
//     assert.deepEqual(resp.status, 204);
//   });

//   it('regular user has 0 volume', async function() {
//     const resp = await header.user1.get(`/volumes`);
//     const json: Page<IVolume<'client'>> = await resp.json();
//     assert.deepEqual(resp.status, 200);
//     assert(json.data.length === 0);
//   });
// });
