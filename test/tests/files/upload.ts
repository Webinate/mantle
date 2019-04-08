import * as assert from 'assert';
import * as path from 'path';
import header from '../header';
import * as fs from 'fs';
import { IFileEntry, IVolume, IUserEntry } from '../../../src';
import { randomString } from '../utils';
import * as FormData from 'form-data';

let volume: IVolume<'expanded'>;
const filePath = './test/media/file.png';

describe('Testing successful file uploads: ', function() {
  before(async function() {
    const resp = await header.user1.post(`/volumes`, { name: randomString() });
    const json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual(resp.status, 200);
    volume = json;
  });

  after(async function() {
    const resp = await header.user1.delete(`/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 204);
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
    assert(files[0].publicURL.length > 0);

    assert.equal(files[0].size, 228);
    assert.equal((files[0].user as IUserEntry<'client'>).username, header.user1.username);

    // Make sure the temp folder is cleaned up
    let filesInTemp = 0;

    fs.readdirSync(path.resolve(__dirname + '/../../../temp')).forEach(file => {
      filesInTemp++;
    });

    // There are 2 files expected in the temp - the .gitignore and readme.md - but thats it
    assert.equal(filesInTemp, 2);
  });

  it('Should error when no more space available', async function() {
    let resp = await header.admin.put(`/volumes/${volume._id}`, { memoryUsed: 5000, memoryAllocated: 5000 } as IVolume<
      'client'
    >);
    assert.equal(resp.status, 200);

    const form = new FormData();
    form.append('good-file', fs.createReadStream(filePath));
    resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());

    assert.equal(decodeURIComponent(resp.statusText), 'You dont have sufficient memory in the volume');
    assert.equal(resp.status, 500);
  });
});
