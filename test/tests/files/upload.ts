import * as assert from 'assert';
import * as path from 'path';
import header from '../header';
import * as fs from 'fs';
import { randomString } from '../utils';
import * as FormData from 'form-data';
import { ADD_VOLUME, REMOVE_VOLUME, UPDATE_VOLUME } from '../../../src/graphql/client/requests/volume';
import { UpdateVolumeInput, AddVolumeInput, Volume } from '../../../src/index';
import { IFileEntry } from '../../../src/types/models/i-file-entry';

let volume: Volume;
const filePath = './test/media/file.png';

describe('Testing successful file uploads: ', function() {
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

  it('Can upload a single file', async function() {
    const form = new FormData();
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files = await resp.json<IFileEntry<'client'>[]>();
    assert.equal(files.length, 1);
    assert.equal(files[0].name, 'file.png');
    assert.equal(files[0].mimeType, 'image/png');
    assert.deepEqual(files[0].parentFile, null);

    // Assert we have a public url
    assert(typeof files[0].publicURL === 'string');
    assert(files[0].publicURL!.length > 0);
    assert.equal(files[0].size, 228);

    // Make sure the temp folder is cleaned up
    let filesInTemp = 0;

    fs.readdirSync(path.resolve(__dirname + '/../../../temp')).forEach(file => {
      filesInTemp++;
    });

    // There are 2 files expected in the temp - the .gitignore and readme.md - but thats it
    assert.equal(filesInTemp, 2);
  });

  it('Should error when no more space available', async function() {
    let resp = await header.admin.graphql<Volume>(UPDATE_VOLUME, {
      token: <UpdateVolumeInput>{
        _id: volume._id,
        memoryUsed: 5000,
        memoryAllocated: 5000
      }
    });

    assert.ok(!resp.errors);

    const form = new FormData();
    form.append('good-file', fs.createReadStream(filePath));
    let fileUpload = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());

    assert.equal(decodeURIComponent(fileUpload.statusText), 'You dont have sufficient memory in the volume');
    assert.equal(fileUpload.status, 500);
  });
});
