import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { randomString } from '../utils';
import { REMOVE_VOLUME, ADD_VOLUME } from '../../../src/graphql/client/requests/volume';
import { GET_FILES } from '../../../src/graphql/client/requests/file';
import { AddVolumeInput, Volume, PaginatedFilesResponse } from '../../../src/index';

let volume: Volume;
const filePath = './test/media/file.png';
let fileUrl = '';

describe('Testing file accessibility functions', function() {
  before(async function() {
    const resp = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: <AddVolumeInput>{
        name: randomString()
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
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('regular user has 1 file', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    });

    fileUrl = resp.data.data[0].publicURL!;
    assert(resp.data.data.length === 1);
  });

  it('did download the file off the volume', async function() {
    const agent = header.createAgent(fileUrl);
    const resp = await agent.get('');
    assert.deepEqual(resp.status, 200);
    assert.deepEqual(resp.headers.get('content-type'), 'image/png');
  });
});
