import * as assert from 'assert';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../../src/graphql/client/requests/volume';
import { UPDATE_FILE } from '../../../src/graphql/client/requests/file';
import { UpdateFileInput, File, AddVolumeInput, Volume } from '../../../src/client-models';

let volume: Volume, fileId: string;
const filePath = './test/media/file.png';

describe('Testing file renaming', function() {
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
    const resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.deepEqual(resp.status, 200);
  });

  it('uploaded file has the name "file.png"', async function() {
    const resp = await header.user1.get(`/files/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 200);
    const json = await resp.json();
    fileId = json.data[0]._id;
    assert.deepEqual(json.data[0].name, 'small-image.png');
  });

  it('regular user did not rename an incorrect file to testy', async function() {
    const resp = await header.user1.graphql<File>(UPDATE_FILE, {
      token: <UpdateFileInput>{
        _id: '123',
        name: 'tesy'
      }
    });

    assert.deepEqual(
      resp.errors![0].message,
      'Variable "$token" got invalid value "123" at "token._id"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('regular user cannot rename a file of another user', async function() {
    const resp = await header.user2.graphql<File>(UPDATE_FILE, {
      token: <UpdateFileInput>{
        _id: fileId,
        name: 'nonono'
      }
    });

    assert.deepEqual(resp.errors![0].message, 'You do not have permission');
  });

  it('regular user regular user did not rename a correct file with an empty name', async function() {
    const resp = await header.user1.graphql<File>(UPDATE_FILE, {
      token: <UpdateFileInput>{
        _id: fileId
      }
    });

    assert.ok(resp.errors![0].message.includes('Field name of required type String! was not provided.'));
  });

  it('regular user did rename a correct file to testy', async function() {
    const resp = await header.user1.graphql<File>(UPDATE_FILE, {
      token: <UpdateFileInput>{
        _id: fileId,
        name: 'testy',
        isPublic: false
      }
    });

    assert(resp.data._id);
    assert.deepEqual(resp.data.name, 'testy');
    assert.deepEqual(resp.data.isPublic, false);
    assert.deepEqual(resp.data.user.username, header.user1.username);
  });

  it('can be updated by an admin', async function() {
    const resp = await header.admin.graphql<File>(UPDATE_FILE, {
      token: <UpdateFileInput>{
        _id: fileId,
        name: 'testy2',
        isPublic: true
      }
    });

    assert(resp.data._id);
    assert.deepEqual(resp.data.name, 'testy2');
    assert.deepEqual(resp.data.isPublic, true);
    assert.deepEqual(resp.data.user.username, header.user1.username);
  });
});
