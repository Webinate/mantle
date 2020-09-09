import * as assert from 'assert';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { GET_VOLUMES } from '../../../src/graphql/client/requests/volume';
import { PaginatedVolumeResponse } from '../../../src/client-models';
import { IVolume } from '../../../src/types/models/i-volume-entry';

let volA: IVolume<'server'>;
let volB: IVolume<'server'>;
let volC: IVolume<'server'>;

describe('Testing volume get requests', function() {
  before(async function() {
    const user1 = await ControllerFactory.get('users').getUser({ username: header.user1.username });
    volA = (await ControllerFactory.get('volumes').create({ name: 'aaa', user: user1!._id })) as IVolume<'server'>;
    volB = (await ControllerFactory.get('volumes').create({ name: 'bbb', user: user1!._id })) as IVolume<'server'>;
    volC = (await ControllerFactory.get('volumes').create({ name: 'ccc', user: user1!._id })) as IVolume<'server'>;

    await uploadFileToVolume('file.png', volB, 'good-file');
    await uploadFileToVolume('file.png', volC, 'good-file');
    await uploadFileToVolume('file.png', volC, 'good-file');
  });

  after(async function() {
    assert(await ControllerFactory.get('volumes').remove({ _id: volA._id }));
    assert(await ControllerFactory.get('volumes').remove({ _id: volB._id }));
    assert(await ControllerFactory.get('volumes').remove({ _id: volC._id }));
  });

  it('filters by creation date by default', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {});
    assert.deepEqual(json.data.length, 3);
    assert.deepEqual(json.data[0]._id, volA._id.toString());
    assert.deepEqual(json.data[2]._id, volC._id.toString());
  });

  it('can filter by name [asc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'name',
      sortOrder: 'asc'
    });

    assert(json.data[0]._id === volA._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volC._id.toString());
  });

  it('can filter by name [desc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'name',
      sortOrder: 'desc'
    });

    assert(json.data[0]._id === volC._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volA._id.toString());
  });

  it('can filter by creation date [asc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'created',
      sortOrder: 'asc'
    });

    assert(json.data[0]._id === volA._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volC._id.toString());
  });

  it('can filter by creation date [desc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'created',
      sortOrder: 'desc'
    });

    assert(json.data[0]._id === volC._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volA._id.toString());
  });

  it('can filter by memory used [asc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'memory',
      sortOrder: 'asc'
    });

    assert(json.data[0]._id === volA._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volC._id.toString());
  });

  it('can filter by memory used [desc]', async function() {
    const { data: json } = await header.user1.graphql<PaginatedVolumeResponse>(GET_VOLUMES, {
      sort: 'memory',
      sortOrder: 'desc'
    });

    assert(json.data[0]._id === volC._id.toString());
    assert(json.data[1]._id === volB._id.toString());
    assert(json.data[2]._id === volA._id.toString());
  });
});
