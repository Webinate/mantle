import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';

const rootPath = `${apiUrl}/files`;

export type GetAllOptions = {
  search: string;
  index: number;
  limit: number;
}

export async function getAll( volumeId: string, options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IFileEntry<'client'>>>( `${rootPath}//volumes/${volumeId}` + makeQueryString( options ) );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IFileEntry<'client'>> ) {
  return putJson<IFileEntry<'client'>>( `${rootPath}/${id}`, token );
}

export function create( volumeId: string, file: Partial<IFileEntry<'client'>> ) {
  return postJson<IFileEntry<'client'>>( `${rootPath}/volumes/${volumeId}/upload/`, file );
}