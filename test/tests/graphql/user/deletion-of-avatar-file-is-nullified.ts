import * as assert from 'assert';
import { IVolume, IFileEntry, IUserEntry, UserPrivilege } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { User, UpdateUserInput } from '../../../../src/graphql/models/user-type';
import { GET_USER, EDIT_USER } from '../../../../src/graphql/client/requests/users';
import { REMOVE_FILE } from '../../../../src/graphql/client/requests/file';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../../../src/graphql/client/requests/volume';
import { AddVolumeInput } from '../../../../src/graphql/models/volume-type';
import { VolumeType } from '../../../../src/core/enums';

let user: User, volume: IVolume<'expanded'>, file: IFileEntry<'expanded'>;

describe('[GQL] Testing deletion of an avatar image nullifies it on the user: ', function() {
  before(async function() {
    const users = ControllerFactory.get('users');

    await header.createUser('user3', 'password', 'user3@test.com', UserPrivilege.admin);
    const dbEntry = await users.getUser({ username: 'user3' });
    user = User.fromEntity(dbEntry!);

    const resp = await header.user3.graphql<IVolume<'expanded'>>(ADD_VOLUME, {
      token: new AddVolumeInput({
        name: randomString(),
        type: VolumeType.local
      })
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
    const resp = await header.user3.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did update the user avatar with the file as an avatar', async function() {
    const resp = await header.user3.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      token: new UpdateUserInput({
        _id: user._id,
        avatarFile: file._id
      })
    });

    assert.equal(resp.data.avatarFile._id, file._id);
  });

  it('did get the avatar image when we get the user resource', async function() {
    const resp = await header.user3.graphql<IUserEntry<'expanded'>>(GET_USER, {
      user: user.username
    });

    assert.deepEqual(resp.data.avatarFile._id, file._id);
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
    } = await header.user3.graphql<IUserEntry<'expanded'>>(GET_USER, {
      user: user.username
    });

    assert.deepEqual(avatarFile, null);
  });
});
