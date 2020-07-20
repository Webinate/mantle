import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import { IFileEntry, IVolume } from '../../../src';
import { randomString } from '../utils';
import * as FormData from 'form-data';
import { AddVolumeInput } from '../../../src/graphql/models/volume-type';
import { ADD_VOLUME, REMOVE_VOLUME, GET_VOLUME } from '../../../src/graphql/client/requests/volume';

let volume: IVolume<'expanded'>;
let uploadedFile: IFileEntry<'expanded'>;
let newFile: IFileEntry<'expanded'>;
const filePath = './test/media/file.png';
const filePath2 = './test/media/img-a.png';

describe('Testing replacing of a file upload: ', function() {
  before(async function() {
    const resp = await header.user1.graphql<IVolume<'expanded'>>(ADD_VOLUME, {
      token: new AddVolumeInput({
        name: randomString()
      })
    });
    assert.ok(resp.data);
    volume = resp.data;
  });

  after(async function() {
    const resp = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.ok(!resp.errors);
    assert.ok(resp.data);
  });

  it('did upload a single file', async function() {
    const form = new FormData();
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);

    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    assert.equal(files[0].name, 'file.png');
    assert.equal(files[0].mimeType, 'image/png');
    assert.deepEqual(files[0].parentFile, null);

    // Assert we have a public url
    assert(typeof files[0].publicURL === 'string');
    assert(files[0].publicURL!.length > 0);

    uploadedFile = files[0];
  });

  it('did replace uploaded file, but only changed its public url', async function() {
    const form = new FormData();
    form.append('good-file-2', fs.createReadStream(filePath2));
    const resp = await header.user1.post(`/files/replace/${uploadedFile._id}`, form, form.getHeaders());
    assert.equal(resp.status, 200);

    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    assert.equal(files[0].name, 'img-a.png');
    assert.equal(files[0].mimeType, 'image/png');
    assert.deepEqual(files[0].parentFile, null);

    // Assert we have a public url
    assert(typeof files[0].publicURL === 'string');
    assert(files[0].publicURL!.length > 0);
    assert(typeof files[0].publicURL !== uploadedFile.publicURL);

    newFile = files[0];
  });

  it('the replaced file matches the users available space', async function() {
    const resp = await header.user1.graphql<IVolume<'expanded'>>(GET_VOLUME, { id: volume._id });
    assert.deepEqual(resp.data.memoryUsed, newFile.size);
  });
});
