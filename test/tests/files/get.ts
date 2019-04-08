import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import { IVolume, IUserEntry } from '../../../src';
import * as FormData from 'form-data';

let volume: IVolume<'expanded'>;
const filePath = './test/media/file.png';

describe('Getting uploaded user files', function() {
  before(async function() {
    const resp = await header.user1.post(`/volumes`, { name: 'dinosaurs' });
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    volume = json;
  });

  after(async function() {
    const resp = await header.user1.delete(`/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 204);
  });

  it('regular user did not get files for a volume with bad id', async function() {
    const resp = await header.user1.get(`/files/volumes/test`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 500);
    assert.deepEqual(json.message, 'Please use a valid identifier for volumeId');
  });

  it('regular user did not get files for a non existant volume', async function() {
    const resp = await header.user1.get(`/files/volumes/123456789012345678901234`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 500);
    assert.deepEqual(json.message, 'Could not find the volume resource');
  });

  it('regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append('small-image.png', fs.readFileSync(filePath), {
      filename: 'small-image.png',
      contentType: 'image/png'
    });
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('regular user did upload another file to dinosaurs', async function() {
    const form = new FormData();
    form.append('small-image.png', fs.readFileSync(filePath), {
      filename: 'small-image.png',
      contentType: 'image/png'
    });
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('regular cannot access another users volume', async function() {
    const resp = await header.user2.get(`/files/volumes/${volume._id}`);
    assert.deepEqual(decodeURIComponent(resp.statusText), 'Could not find the volume resource');
    assert.deepEqual(resp.status, 500);
  });

  it('regular user fetched 2 files from the dinosaur volume', async function() {
    const resp = await header.user1.get(`/files/volumes/${volume._id}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 2);
    assert.deepEqual(json.data[0].numDownloads, 0);
    assert.deepEqual(json.data[0].size, 228);
    assert.deepEqual(json.data[0].mimeType, 'image/png');
    assert.deepEqual((json.data[0].user as IUserEntry<'client'>).username, header.user1.username);
    assert(json.data[0].publicURL);
    assert(json.data[0].isPublic);
    assert(json.data[0].identifier);
    assert(json.data[0].volumeId);
    assert(json.data[0].created);
    assert.deepEqual(json.data[0].volumeName, 'dinosaurs');
    assert(json.data[0]._id);
  });

  it('admin fetched 2 files from the regular users dinosaur volume', async function() {
    const resp = await header.admin.get(`/files/volumes/${volume._id}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 2);
  });
});
