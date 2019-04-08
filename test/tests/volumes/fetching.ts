import * as assert from 'assert';
import header from '../header';
import { IAdminUser, Page, IVolume, IUserEntry } from '../../../src';

let volumeJson: IVolume<'expanded'>;

describe('Testing volume get requests', function() {
  it('regular user did create a volume dinosaurs', async function() {
    const resp = await header.user1.post(`/volumes`, { name: 'dinosaurs' } as IVolume<'expanded'>);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    volumeJson = json;
  });

  it('regular user has 1 volume', async function() {
    const resp = await header.user1.get(`/volumes`);
    const json: Page<IVolume<'client'>> = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 1);
    const volume = json.data[0];
    assert.equal(volume._id, volumeJson._id);
    assert.deepEqual(volume.name, 'dinosaurs');
    assert.deepEqual((volume.user as IUserEntry<'client'>).username, header.user1.username);
    assert.deepEqual(volume.memoryUsed, 0);
    assert(volume.created > 0);
    assert(volume.identifier !== '');
  });

  it('prevents getting a single volume with a bad id', async function() {
    const resp = await header.admin.get(`/volumes/BAD`);
    assert.deepEqual(decodeURIComponent(resp.statusText), 'Invalid ID format');
    assert.deepEqual(resp.status, 500);
  });

  it('prevents getting a single volume that doesnt exist', async function() {
    const resp = await header.admin.get(`/volumes/123456789123456789123456`);
    assert.deepEqual(decodeURIComponent(resp.statusText), 'Volume does not exist');
    assert.deepEqual(resp.status, 500);
  });

  it("prevents regular users from getting other users' volumes", async function() {
    const resp = await header.user2.get(`/volumes/${volumeJson._id}`);
    assert.deepEqual(decodeURIComponent(resp.statusText), 'You do not have permission');
    assert.deepEqual(resp.status, 403);
  });

  it('allows an admin to get a single volume', async function() {
    const resp = await header.admin.get(`/volumes/${volumeJson._id}`);
    const volume = await resp.json<IVolume<'client'>>();
    assert.deepEqual(resp.status, 200);
    assert.equal(volume._id, volumeJson._id);
    assert.deepEqual(volume.name, 'dinosaurs');
    assert.deepEqual((volume.user as IUserEntry<'client'>).username, header.user1.username);
    assert.deepEqual(volume.memoryUsed, 0);
    assert(volume.created > 0);
    assert(volume.identifier !== '');
  });

  it('regular user did not get volumes for admin', async function() {
    const resp = await header.user1.get(`/volumes?user=${(header.config.adminUser as IAdminUser).username}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 403);
  });

  it('other regular user did not get volumes for regular user', async function() {
    const resp = await header.user2.get(`/volumes?user=${(header.config.adminUser as IAdminUser).username}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 403);
  });

  it('admin can see regular user has 1 volume', async function() {
    const resp = await header.admin.get(`/volumes?user=${header.user1.username}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 1);
  });

  it('regular user did remove the volume dinosaurs', async function() {
    const resp = await header.user1.delete(`/volumes/${volumeJson._id}`);
    assert.deepEqual(resp.status, 204);
  });
});
