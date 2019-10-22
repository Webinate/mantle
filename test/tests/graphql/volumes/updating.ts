import * as assert from 'assert';
import header from '../../header';
import { IVolume } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { UPDATE_VOLUME } from '../queries/volumes';

let volumeJson: IVolume<'expanded'>;

describe('[GQL] Testing volume update requests: ', function() {
  before(async function() {
    const user1 = await ControllerFactory.get('users').getUser({ username: header.user1.username });
    volumeJson = (await ControllerFactory.get('volumes').create({ name: 'dinosaurs', user: user1._id })) as IVolume<
      'expanded'
    >;
  });

  after(async function() {
    assert(await ControllerFactory.get('volumes').remove({ _id: volumeJson._id }));
  });

  it('prevents regular users from updating a volume', async function() {
    const { errors } = await header.user2.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: volumeJson._id,
      token: {}
    });
    assert.deepEqual(errors[0].message, 'You do not have permission');
  });

  it('prevents updating a single volume with a bad id', async function() {
    const { errors } = await header.admin.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, { id: 'BAD', token: {} });
    assert.deepEqual(
      errors[0].message,
      'Variable "$id" got invalid value "BAD"; Expected type ObjectId; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('prevents updating a single volume that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: '123456789123456789123456',
      token: {}
    });
    assert.deepEqual(errors[0].message, 'Volume does not exist');
  });

  it('should disallow a regular user to update memoryUsed', async function() {
    const { errors } = await header.user1.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: volumeJson._id,
      token: { memoryUsed: 0 } as IVolume<'client'>
    });
    assert.deepEqual(errors[0].message, "You don't have permission to set the memoryUsed");
  });

  it('should disallow a regular user to update memoryAllocated', async function() {
    const { errors } = await header.user1.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: volumeJson._id,
      token: { memoryAllocated: 5000 } as IVolume<'client'>
    });
    assert.deepEqual(errors[0].message, "You don't have permission to set the memoryAllocated");
  });

  it('should allow an admin to update memoryAllocated & memoryUsed', async function() {
    const { data: json } = await header.admin.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: volumeJson._id,
      token: { memoryUsed: 0, memoryAllocated: 5000 } as IVolume<'client'>
    });

    assert.deepEqual(json.memoryUsed, 0);
    assert.deepEqual(json.memoryAllocated, 5000);
  });

  it('allows an admin to update a single volume', async function() {
    const { data: json } = await header.admin.graphql<IVolume<'expanded'>>(UPDATE_VOLUME, {
      id: volumeJson._id,
      token: { name: 'dinosaurs2', memoryUsed: 0, memoryAllocated: 5000 } as IVolume<'client'>
    });

    assert.deepEqual(json.memoryUsed, 0);
    assert.deepEqual(json.memoryAllocated, 5000);
    assert.deepEqual(json.name, 'dinosaurs2');
  });
});
