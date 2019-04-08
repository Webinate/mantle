import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import { IVolume } from '../../../src';
import * as FormData from 'form-data';

let volume: IVolume<'expanded'>;
const filePath = './test/media/file.png';
let fileId;

describe('Testing files deletion', function() {
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

  it('regular user did upload a file to dinosaurs', async function() {
    const form = new FormData();
    form.append('small-image.png', fs.readFileSync(filePath), {
      filename: 'small-image.png',
      contentType: 'image/png'
    });
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('regular user has 1 file', async function() {
    const resp = await header.user1.get(`/files/volumes/${volume._id}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    fileId = json.data[0]._id;
    assert(json.data.length === 1);
  });

  it('regular user did not remove a file with a bad id', async function() {
    const resp = await header.user1.delete(`/files/123`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 500);
    assert.deepEqual(json.message, 'Invalid file ID format');
  });

  it('regular user did remove a file with a valid id', async function() {
    const resp = await header.user1.delete(`/files/${fileId}`);
    assert.deepEqual(resp.status, 204);
  });

  it('regular user has 0 files', async function() {
    const resp = await header.user1.get(`/files/volumes/${volume._id}`);
    const json = await resp.json();
    assert.deepEqual(resp.status, 200);
    assert(json.data.length === 0);
  });

  // TODO: Add a test for regular user deletion permission denial?
  // TODO: Add a test for admin deletion of user file?
});
