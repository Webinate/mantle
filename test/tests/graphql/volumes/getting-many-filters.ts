// import * as assert from 'assert';
// import header from '../../header';
// import { Page, IVolume } from '../../../../src';
// import ControllerFactory from '../../../../src/core/controller-factory';
// import { uploadFileToVolume } from '../../file';
// import { GET_VOLUMES } from '../queries/volumes';

// let volA: IVolume<'expanded'>;
// let volB: IVolume<'expanded'>;
// let volC: IVolume<'expanded'>;

// describe('[GQL] Testing volume get requests', function() {
//   before(async function() {
//     const user1 = await ControllerFactory.get('users').getUser({ username: header.user1.username });
//     volA = (await ControllerFactory.get('volumes').create({ name: 'aaa', user: user1._id })) as IVolume<'expanded'>;
//     volB = (await ControllerFactory.get('volumes').create({ name: 'bbb', user: user1._id })) as IVolume<'expanded'>;
//     volC = (await ControllerFactory.get('volumes').create({ name: 'ccc', user: user1._id })) as IVolume<'expanded'>;

//     await uploadFileToVolume('file.png', volB, 'good-file');
//     await uploadFileToVolume('file.png', volC, 'good-file');
//     await uploadFileToVolume('file.png', volC, 'good-file');
//   });

//   after(async function() {
//     assert(await ControllerFactory.get('volumes').remove({ _id: volA._id }));
//     assert(await ControllerFactory.get('volumes').remove({ _id: volB._id }));
//     assert(await ControllerFactory.get('volumes').remove({ _id: volC._id }));
//   });

//   it('filters by creation date by default', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {});
//     assert.deepEqual(json.data.length, 3);
//     assert.deepEqual(json.data[0]._id, volA._id);
//     assert.deepEqual(json.data[2]._id, volC._id);
//   });

//   it('can filter by name [asc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'name',
//       sortOrder: 'asc'
//     });

//     assert(json.data[0]._id === volA._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volC._id);
//   });

//   it('can filter by name [desc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'name',
//       sortOrder: 'desc'
//     });

//     assert(json.data[0]._id === volC._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volA._id);
//   });

//   it('can filter by creation date [asc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'created',
//       sortOrder: 'asc'
//     });

//     assert(json.data[0]._id === volA._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volC._id);
//   });

//   it('can filter by creation date [desc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'created',
//       sortOrder: 'desc'
//     });

//     assert(json.data[0]._id === volC._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volA._id);
//   });

//   it('can filter by memory used [asc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'memory',
//       sortOrder: 'asc'
//     });

//     assert(json.data[0]._id === volA._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volC._id);
//   });

//   it('can filter by memory used [desc]', async function() {
//     const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {
//       sort: 'memory',
//       sortOrder: 'desc'
//     });

//     assert(json.data[0]._id === volC._id);
//     assert(json.data[1]._id === volB._id);
//     assert(json.data[2]._id === volA._id);
//   });
// });
