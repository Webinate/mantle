import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { GET_USER, EDIT_USER } from '../../client/requests/users';
import { REMOVE_FILE } from '../../client/requests/file';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../client/requests/volume';
import { AddVolumeInput, UpdateUserInput, File, Volume, User } from '../../../src/index';
import { IUserEntry } from '../../../src/types';
let user: IUserEntry<'server'>, volume: Volume, file: File;

describe('Testing deletion of an avatar image nullifies it on the user: ', function() {
  before(async function() {
    const users = ControllerFactory.get('users');

    await header.createUser('user3', 'password', 'user3@test.com', 'admin');
    const dbEntry = await users.getUser({ username: 'user3' });
    user = dbEntry!;

    const resp = await header.user3.graphql<Volume>(ADD_VOLUME, {
      token: {
        name: randomString(),
        type: 'local'
      } as AddVolumeInput
    });

    volume = resp.data;
    assert.ok(!resp.errors, resp.errors?.[0]?.message);
    assert.ok(volume);
  });

  after(async function() {
    const resp = await header.user3.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.ok(!resp.errors, resp.errors?.[0]?.message);
    assert.deepEqual(resp.data, true);
  });

  it('did upload a single file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.user3.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files: File[] = await resp.json();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did update the user avatar with the file as an avatar', async function() {
    const resp = await header.user3.graphql<User>(EDIT_USER, {
      token: {
        _id: user._id,
        avatarFile: file._id
      } as UpdateUserInput
    });

    assert.equal(resp.data.avatarFile!._id, file._id);
  });

  it('did get the avatar image when we get the user resource', async function() {
    const resp = await header.user3.graphql<User>(GET_USER, {
      user: user.username
    });

    assert.deepEqual(resp.data.avatarFile!._id, file._id);
  });

  it('did delete the uploaded file', async function() {
    const { data: fileDeleted } = await header.user3.graphql<boolean>(REMOVE_FILE, {
      id: file._id
    });

    assert(fileDeleted);
  });

  it('did nullify the image for the users avatar', async function() {
    const {
      data: { avatarFile }
    } = await header.user3.graphql<User>(GET_USER, {
      user: user.username
    });

    assert.deepEqual(avatarFile, null);
  });
});
