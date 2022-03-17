import * as assert from 'assert';
import header from '../header';
import { ADD_VOLUME, GET_VOLUME, GET_VOLUMES, REMOVE_VOLUME } from '../../client/requests/volume';
import { Volume, PaginatedVolumeResponse, AddVolumeInput } from '../../../src/index';
import { IAdminUser } from '../../../src/types';

let volumeJson: Volume;

describe('Testing volume get requests', function() {
  it('regular user did create a volume dinosaurs', async function() {
    const { data: json } = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: { name: 'dinosaurs' } as AddVolumeInput
    });

    assert(json._id);
    volumeJson = json;
  });

  it('regular user has 1 volume', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {});
    assert(json.data.length === 1);
    const volume = json.data[0];
    assert.equal(volume._id, volumeJson._id);
    assert.deepEqual(volume.name, 'dinosaurs');
    assert.deepEqual(volume.user.username, header.user1.username);
    assert.deepEqual(volume.memoryUsed, 0);
    assert(volume.created > 0);
    assert(volume.identifier !== '');
  });

  it('prevents getting a single volume with a bad id', async function() {
    const { errors } = await header.admin.graphql<Volume>(GET_VOLUME, { id: 'BAD' });
    assert.deepEqual(
      errors![0].message,
      'Variable "$id" got invalid value "BAD"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters'
    );
  });

  it('prevents getting a single volume that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<Volume>(GET_VOLUME, { id: '123456789123456789123456' });
    assert.deepEqual(errors![0].message, 'Volume does not exist');
  });

  it('prevents regular users from getting other users volumes', async function() {
    const { errors } = await header.user2.graphql<Volume>(GET_VOLUME, { id: volumeJson._id });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('allows an admin to get a single volume', async function() {
    const { data: volume } = await header.admin.graphql<Volume>(GET_VOLUME, { id: volumeJson._id });

    assert.equal(volume._id, volumeJson._id);
    assert.deepEqual(volume.name, 'dinosaurs');
    assert.deepEqual(volume.user.username, header.user1.username);
    assert.deepEqual(volume.memoryUsed, 0);
    assert(volume.created > 0);
    assert(volume.identifier !== '');
  });

  it('regular user did not get volumes for admin', async function() {
    const { errors } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      user: (header.config.adminUser as IAdminUser).username
    });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('other regular user did not get volumes for regular user', async function() {
    const { errors } = await header.user2.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      user: header.user1.username
    });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('admin can see regular user has 1 volume', async function() {
    const { data: json } = await header.admin.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      user: header.user1.username
    });

    assert(json.data.length === 1);
  });

  it('regular user did remove the volume dinosaurs', async function() {
    const { data: wasRemoved } = await header.user1.graphql<boolean>(REMOVE_VOLUME, {
      id: volumeJson._id
    });

    assert(wasRemoved);
  });
});
