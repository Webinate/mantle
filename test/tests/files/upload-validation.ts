import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import header from '../header';
import { randomString } from '../utils';
import * as FormData from 'form-data';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../../src/graphql/client/requests/volume';
import { AddVolumeInput, Volume } from '../../../src/client-models';
import { IUploadResponse } from '../../../src/types/tokens/i-file-tokens';

const goodFilePath = './test/media/file.png';
const dangerousFile = './test/media/dangerous.sh';
const bigFile = './test/media/big-image.bmp';
let volume: Volume;

describe('Testing volume upload validation: ', function() {
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

  it('must fail if no volume specified', async function() {
    const form = new FormData();
    form.append('file', fs.readFileSync(goodFilePath));
    const resp = await header.user1.post(`/files/volumes/ /upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);
    assert.equal(decodeURIComponent(resp.statusText), `Incorrect volume id format`);
  });

  it('must fail if volume does not use a valid volume id', async function() {
    const form = new FormData();
    form.append('file', fs.readFileSync(goodFilePath));
    const resp = await header.user1.post(`/files/volumes/BAD_ID/upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);
    assert.equal(decodeURIComponent(resp.statusText), `Incorrect volume id format`);
  });

  it('must fail if volume does not exist', async function() {
    const form = new FormData();
    form.append('file', fs.readFileSync(goodFilePath));
    const resp = await header.user1.post(`/files/volumes/123456789012/upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);
    assert.equal(decodeURIComponent(resp.statusText), `Volume does not exist`);
  });

  it('must fail if another user tries to upload into your volume', async function() {
    const form = new FormData();
    form.append('file', fs.readFileSync(goodFilePath));
    const resp = await header.user2.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(decodeURIComponent(resp.statusText), `Volume does not exist`);
    assert.equal(resp.status, 500);
  });

  it('must fail if non-supported file is uploaded', async function() {
    const form = new FormData();
    form.append('dangerous', fs.createReadStream(dangerousFile));
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);
    assert.equal(decodeURIComponent(resp.statusText), `Extension application/x-sh not supported`);
  });

  it('must ignore form fields', async function() {
    const form = new FormData();
    form.append('some-field', 'Please ignore');
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    const data = await resp.json<IUploadResponse>();
    assert.equal(resp.status, 200);
    assert.deepEqual(data.length, 0);
  });

  it('Must fail if files over the size limit', async function() {
    const form = new FormData();
    form.append('big-file', fs.createReadStream(bigFile));
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);
    assert.equal(decodeURIComponent(resp.statusText), `maxFileSize exceeded, received 525441 bytes of file data`);
  });

  it('Must fail all uploads if even one is not accepted', async function() {
    const form = new FormData();
    form.append('big-file', fs.createReadStream(bigFile));
    form.append('good-file', fs.createReadStream(goodFilePath));
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 500);

    let filesInTemp = 0;

    fs.readdirSync(path.resolve(__dirname + '/../../../temp')).forEach(file => {
      filesInTemp++;
    });

    // There are 2 files expected in the temp - the .gitignore and readme.md - but thats it
    assert.equal(filesInTemp, 2);
  });
});
