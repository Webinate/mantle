import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../client/requests/volume';
import { GET_FILES, REMOVE_FILE } from '../../client/requests/file';
import { AddVolumeInput, Volume, PaginatedFilesResponse } from '../../../src/index';

let volume: Volume;
const filePath = './test/media/file.png';
let fileId: string;

describe('Testing files deletion', function() {
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

  it('regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append('small-image.png', fs.readFileSync(filePath), {
      filename: 'small-image.png',
      contentType: 'image/png'
    });
    const resp = await header.user1.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('regular user has 1 file', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    });

    fileId = resp.data.data[0]._id;
    assert(resp.data.data.length === 1);
  });

  it('regular user did not remove a file with a bad id', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(REMOVE_FILE, {
      id: '123'
    });

    assert.deepEqual(
      resp.errors![0].message,
      'Variable "$id" got invalid value "123"; Expected type "ObjectId". Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer'
    );
  });

  it('regular user did remove a file with a valid id', async function() {
    const resp = await header.user1.graphql<boolean>(REMOVE_FILE, {
      id: fileId
    });

    assert.deepEqual(resp.data, true);
  });

  it('regular user has 0 files', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    });

    assert(resp.data.data.length === 0);
  });

  // TODO: Add a test for regular user deletion permission denial?
  // TODO: Add a test for admin deletion of user file?
});
