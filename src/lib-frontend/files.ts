import { getJson, makeQueryString, del, putJson, post, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';

const rootPath = `${apiUrl}/files`;

export type GetAllOptions = {
  search: string;
  index: number;
  limit: number;
  sort: 'created' | 'name' | 'memory';
  sortOrder: 'asc' | 'desc';
}

export async function getAll( volumeId: string, options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IFileEntry<'client'>>>( `${rootPath}/volumes/${volumeId}` + makeQueryString( options ) );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IFileEntry<'client'>> ) {
  return putJson<IFileEntry<'client'>>( `${rootPath}/${id}`, token );
}

export async function create( volumeId: string, file: File ) {
  const data = new FormData();
  data.append( 'file', file );

  const resp = await post( `${rootPath}/volumes/${volumeId}/upload/`, data );
  const toRet: IFileEntry<'client'> = await resp.json();
  return toRet;
}