import * as assert from 'assert';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { UPDATE_VOLUME } from '../../../src/graphql/client/requests/volume';
import { UpdateVolumeInput } from '../../../src/graphql/models/volume-type';
import { Volume } from '../../../src/index';
import { IVolume } from '../../../src/types/models/i-volume-entry';

let volumeJson: IVolume<'server'>;

describe('Testing volume update requests: ', function() {
  before(async function() {
    const user1 = await ControllerFactory.get('users').getUser({ username: header.user1.username });
    volumeJson = (await ControllerFactory.get('volumes').create({ name: 'dinosaurs', user: user1!._id })) as IVolume<
      'server'
    >;
  });

  after(async function() {
    assert(await ControllerFactory.get('volumes').remove({ _id: volumeJson._id }));
  });

  it('prevents regular users from updating a volume', async function() {
    const { errors } = await header.user2.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: volumeJson._id })
    });
    assert.deepEqual(errors![0].message, 'You do not have permission');
  });

  it('prevents updating a single volume with a bad id', async function() {
    const { errors } = await header.admin.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: 'BAD' })
    });
    assert.deepEqual(
      errors![0].message,
      'Variable "$token" got invalid value "BAD" at "token._id"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('prevents updating a single volume that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: '123456789123456789123456' })
    });
    assert.deepEqual(errors![0].message, 'Volume does not exist');
  });

  it('should disallow a regular user to update memoryUsed', async function() {
    const { errors } = await header.user1.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: volumeJson._id, memoryUsed: 0 })
    });
    assert.deepEqual(errors![0].message, `You don't have permission to set the memoryUsed`);
  });

  it('should disallow a regular user to update memoryAllocated', async function() {
    const { errors } = await header.user1.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: volumeJson._id, memoryAllocated: 5000 })
    });
    assert.deepEqual(errors![0].message, `You don't have permission to set the memoryAllocated`);
  });

  it('should allow an admin to update memoryAllocated & memoryUsed', async function() {
    const { data: json } = await header.admin.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: volumeJson._id, memoryUsed: 0, memoryAllocated: 5000 })
    });

    assert.deepEqual(json.memoryUsed, 0);
    assert.deepEqual(json.memoryAllocated, 5000);
  });

  it('allows an admin to update a single volume', async function() {
    const { data: json } = await header.admin.graphql<Volume>(UPDATE_VOLUME, {
      token: new UpdateVolumeInput({ _id: volumeJson._id, name: 'dinosaurs2', memoryUsed: 0, memoryAllocated: 5000 })
    });

    assert.deepEqual(json.memoryUsed, 0);
    assert.deepEqual(json.memoryAllocated, 5000);
    assert.deepEqual(json.name, 'dinosaurs2');
  });
});
