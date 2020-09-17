import * as assert from 'assert';
import header from '../header';
import { ADD_VOLUME, GET_VOLUMES, REMOVE_VOLUME } from '../../../src/graphql/client/requests/volume';
import ControllerFactory from '../../../src/core/controller-factory';
import { Volume, PaginatedVolumeResponse, AddVolumeInput } from '../../../src/index';

let volume1: string, volume2: string;

describe('Testing volume creation', function() {
  it('regular user did not create a volume for another user', async function() {
    const user2 = await ControllerFactory.get('users').getUser({ username: 'user2' });

    const { errors } = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: { name: 'test', user: user2!._id } as AddVolumeInput
    });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('regular user is not allowed to set memoryAllocated for volume creation', async function() {
    const { errors } = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: { memoryAllocated: 0, name: 'dinosaurs' } as AddVolumeInput
    });
    assert.deepEqual(errors![0].message, `You don't have permission to set the memoryAllocated`);
  });

  it('regular user did create a new volume called dinosaurs', async function() {
    const { errors, data: json } = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: { name: 'dinosaurs' } as AddVolumeInput
    });

    assert.deepEqual(errors, undefined);
    assert(json.hasOwnProperty('_id'));
    assert.deepEqual(json.name, 'dinosaurs');
    assert.deepEqual(json.type, 'local');
    assert.deepEqual(json.user.username, header.user1.username);
    assert.deepEqual(json.memoryUsed, 0);
    assert.equal(json.memoryAllocated, 500000000);
    assert(json.created > 0);
    assert(json.identifier !== '');
    volume1 = json._id as string;
  });

  it('admin user did create a volume with a different name for regular user', async function() {
    const user1 = await ControllerFactory.get('users').getUser({ username: 'user1' });
    const { data: json } = await header.admin.graphql<Volume>(ADD_VOLUME, {
      token: { name: 'dinosaurs2', user: user1!._id } as AddVolumeInput
    });

    assert(json.hasOwnProperty('_id'));
    assert.deepEqual(json.name, 'dinosaurs2');
    assert.deepEqual(json.user.username, header.user1.username);
    volume2 = json._id as string;
  });

  it('regular user should have 2 volumes', async function() {
    const response = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {});
    assert(response.data.data.length === 2);
  });

  it('regular user did remove the volume dinosaurs', async function() {
    const { data: volumeRemoved } = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume1 });
    assert.deepEqual(volumeRemoved, true);
  });

  it('regular user did remove the volume dinosaurs', async function() {
    const { data: volumeRemoved } = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume2 });
    assert.deepEqual(volumeRemoved, true);
  });
});
