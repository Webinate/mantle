import * as assert from 'assert';
import { IVolume, IFileEntry, IUserEntry } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { EDIT_USER, GET_USER } from '../queries/users';

let user: IUserEntry<'expanded'>, volume: IVolume<'expanded'>, file: IFileEntry<'expanded'>;

describe('[GQL] Testing deletion of an avatar image nullifies it on the user: ', function() {
  before(async function() {
    const users = ControllerFactory.get('users');

    await header.createUser('user3', 'password', 'user3@test.com', 'admin');
    user = (await users.getUser({ username: 'user3' })) as IUserEntry<'expanded'>;

    const resp = await header.user3.post(`/volumes`, { name: randomString() });
    const json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual(resp.status, 200);
    volume = json;
  });

  after(async function() {
    const resp = await header.user3.delete(`/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 204);
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
    const {
      data: { avatarFile }
    } = await header.user3.graphql<IUserEntry<'expanded'>>(EDIT_USER, {
      id: user._id,
      token: { avatarFile: file._id } as IUserEntry<'client'>
    });

    assert.equal(avatarFile._id, file._id);
  });

  it('did get the avatar image when we get the user resource', async function() {
    const {
      data: { avatarFile }
    } = await header.user3.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: user.username
    });

    assert.deepEqual(avatarFile._id, file._id);
  });

  it('did delete the uploaded file', async function() {
    const resp = await header.user3.delete(`/files/${file._id}`);
    assert.equal(resp.status, 204);
  });

  it('did nullify the image for the users avatar', async function() {
    const {
      data: { avatarFile }
    } = await header.user3.graphql<IUserEntry<'expanded'>>(GET_USER, {
      username: user.username
    });

    assert.deepEqual(avatarFile, null);
  });
});
