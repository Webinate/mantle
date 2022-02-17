import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { REMOVE_VOLUME, ADD_VOLUME } from '../../client/requests/volume';
import { GET_FILES } from '../../client/requests/file';
import { AddVolumeInput, Volume, PaginatedFilesResponse } from '../../../src/index';

let volume: Volume;
const filePath = './test/media/file.png';

describe('Getting uploaded user files', function() {
  before(async function() {
    const resp = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: <AddVolumeInput>{
        name: 'dinosaurs'
      }
    });
    assert.ok(resp.data);
    volume = resp.data;
  });

  after(async function() {
    const resp = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.ok(!resp.errors);
    assert.ok(resp.data);
  });

  it('regular user did not get files for a volume with bad id', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: 'test'
    });

    assert.deepEqual(
      resp.errors![0].message,
      'Variable "$volumeId" got invalid value "test"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('regular user did not get files for a non existant volume', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: '123456789012345678901234'
    });

    assert.deepEqual(resp.errors![0].message, 'Could not find the volume resource');
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

  it('regular user cannot access another users volume', async function() {
    const resp = await header.user2.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    });

    assert.deepEqual(resp.errors![0].message, 'You do not have permission');
  });

  it('regular user fetched 2 files from the dinosaur volume', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    });

    const files = resp.data.data;

    assert(files.length === 2);
    assert.deepEqual(files[0].numDownloads, 0);
    assert.deepEqual(files[0].size, 228);
    assert.deepEqual(files[0].mimeType, 'image/png');
    assert.deepEqual(files[0].user.username, header.user1.username);
    assert(files[0].publicURL);
    assert(files[0].isPublic);
    assert(files[0].identifier);
    assert.deepEqual(files[0].volume._id, volume._id.toString());
    assert(files[0].created);
    assert.deepEqual(files[0].isPublic, true);
    assert.deepEqual(files[0].volume.name, 'dinosaurs');
    assert(files[0]._id);
  });

  it('admin fetched 2 files from the regular users dinosaur volume', async function() {
    const resp = await header.admin.get(`/files/volumes/${volume._id}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 2);
  });
});
