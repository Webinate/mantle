import * as assert from 'assert';
import header from '../header';
import { Page, IVolume, IFileEntry } from '../../../src';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { AddVolumeInput } from '../../../src/graphql/models/volume-type';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../../src/graphql/client/requests/volume';
import { GET_FILES } from '../../../src/graphql/client/requests/file';
import { FileSortType, SortOrder } from '../../../src/core/enums';

let volume: IVolume<'expanded'>;
let fileA: IFileEntry<'expanded'>;
let fileB: IFileEntry<'expanded'>;
let fileC: IFileEntry<'expanded'>;

describe('Testing volume get requests', function() {
  before(async function() {
    let addVolumeResp = await header.user1.graphql<IVolume<'expanded'>>(ADD_VOLUME, {
      token: new AddVolumeInput({
        name: 'aaa'
      })
    });

    assert.ok(addVolumeResp.data);
    volume = addVolumeResp.data;

    // Upload files
    let form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-a.png'));
    let resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileA = (await resp.json<IFileEntry<'expanded'>[]>())[0];
    assert.equal(resp.status, 200);

    form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-b.png'));
    resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileB = (await resp.json<IFileEntry<'expanded'>[]>())[0];
    assert.equal(resp.status, 200);

    form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-c.png'));
    resp = await header.user1.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileC = (await resp.json<IFileEntry<'expanded'>[]>())[0];
    assert.equal(resp.status, 200);
  });

  after(async function() {
    const resp = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.ok(!resp.errors);
    assert.ok(resp.data);
  });

  it('filters by creation date by default', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id
    });

    assert(resp.data.data.length === 3);
    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by name [asc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.name,
      sortOrder: SortOrder.asc
    });

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by name [desc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.name,
      sortOrder: SortOrder.desc
    });

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });

  it('can filter by creation date [asc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.created,
      sortOrder: SortOrder.asc
    });

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by creation date [desc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.created,
      sortOrder: SortOrder.desc
    });

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });

  it('can filter by memory used [asc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.memory,
      sortOrder: SortOrder.asc
    });

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by memory used [desc]', async function() {
    const resp = await header.user1.graphql<Page<IFileEntry<'expanded'>>>(GET_FILES, {
      volumeId: volume._id,
      sortType: FileSortType.memory,
      sortOrder: SortOrder.desc
    });

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });
});
