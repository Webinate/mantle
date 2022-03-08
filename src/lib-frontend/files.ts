import { getJson, makeQueryString, del, putJson, post, apiUrl } from './http-clients';
import { IFileEntry, Page } from '../types';
import { FilesGetOptions } from '../core/enums';

const rootPath = `${apiUrl}/files`;

export async function getAll(volumeId: string, options: Partial<FilesGetOptions>) {
  const page = await getJson<Page<IFileEntry<'client' | 'expanded'>>>(
    `${rootPath}/volumes/${volumeId}` + makeQueryString(options as any)
  );
  return page;
}

export function remove(id: string) {
  return del(`${rootPath}/${id}`);
}

export function update(id: string, token: Partial<IFileEntry<'client'>>) {
  return putJson<IFileEntry<'client' | 'expanded'>>(`${rootPath}/${id}`, token);
}

export async function replaceFile(fileId: string, file: File) {
  const data = new FormData();
  data.append('file', file);

  const resp = await post(`${rootPath}/replace/${fileId}`, data);
  const toRet: IFileEntry<'client' | 'expanded'> = await resp.json();
  return toRet;
}

export async function create(volumeId: string, file: File) {
  const data = new FormData();
  data.append('file', file);

  const resp = await post(`${rootPath}/volumes/${volumeId}/upload/`, data);
  const toRet: IFileEntry<'client' | 'expanded'> = await resp.json();
  return toRet;
}
