import * as assert from 'assert';
import header from '../header';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { ADD_VOLUME, REMOVE_VOLUME } from '../../client/requests/volume';
import { GET_FILES } from '../../client/requests/file';
import { AddVolumeInput, Volume, PaginatedFilesResponse, QueryFilesArgs } from '../../../src/index';
import { IFileEntry } from '../../../src/types';

let volume: Volume;
let fileA: IFileEntry<'expanded'>;
let fileB: IFileEntry<'expanded'>;
let fileC: IFileEntry<'expanded'>;

describe('Testing volume get requests', function() {
  before(async function() {
    let addVolumeResp = await header.user1.graphql<Volume>(ADD_VOLUME, {
      token: <AddVolumeInput>{
        name: 'aaa'
      }
    });

    assert.ok(addVolumeResp.data);
    volume = addVolumeResp.data;

    // Upload files
    let form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-a.png'));
    let resp = await header.user1.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileA = ((await resp.json()) as IFileEntry<'expanded'>[])[0];
    assert.equal(resp.status, 200);

    form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-b.png'));
    resp = await header.user1.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileB = ((await resp.json()) as IFileEntry<'expanded'>[])[0];
    assert.equal(resp.status, 200);

    form = new FormData();
    form.append('good-file', fs.createReadStream('./test/media/img-c.png'));
    resp = await header.user1.post(`/api/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    fileC = ((await resp.json()) as IFileEntry<'expanded'>[])[0];
    assert.equal(resp.status, 200);
  });

  after(async function() {
    const resp = await header.user1.graphql<boolean>(REMOVE_VOLUME, { id: volume._id });
    assert.ok(!resp.errors);
    assert.ok(resp.data);
  });

  it('filters by creation date by default', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id
    } as QueryFilesArgs);

    assert(resp.data.data.length === 3);
    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by name [asc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'name',
      sortOrder: 'asc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by name [desc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'name',
      sortOrder: 'desc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });

  it('can filter by creation date [asc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'created',
      sortOrder: 'asc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by creation date [desc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'created',
      sortOrder: 'desc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });

  it('can filter by memory used [asc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'memory',
      sortOrder: 'asc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileA._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileC._id);
  });

  it('can filter by memory used [desc]', async function() {
    const resp = await header.user1.graphql<PaginatedFilesResponse>(GET_FILES, {
      volumeId: volume._id,
      sortType: 'memory',
      sortOrder: 'desc'
    } as QueryFilesArgs);

    assert(resp.data.data[0]._id === fileC._id);
    assert(resp.data.data[1]._id === fileB._id);
    assert(resp.data.data[2]._id === fileA._id);
  });
});
