import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import { IVolume } from '../../../src';
import * as FormData from 'form-data';

let volume: IVolume<'expanded'>;
const filePath = './test/media/file.png';
let fileUrl;

describe('Getting and setting user media stat usage', async function() {
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
    fileUrl = json.data[0].publicURL;
    assert(json.data.length === 1);
  });

  it('did download the file off the volume', async function() {
    const agent = header.createAgent(fileUrl);
    const resp = await agent.get('');
    assert.deepEqual(resp.status, 200);
    assert.deepEqual(resp.headers.get('content-type'), 'image/png');
  });
});
