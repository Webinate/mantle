import { getJson, makeQueryString, del, putJson, post, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IFileEntry } from '../types/models/i-file-entry';
import { FilesGetOptions } from '../controllers/files';

const rootPath = `${apiUrl}/files`;

export async function getAll( volumeId: string, options: Partial<FilesGetOptions> ) {
  const page = await getJson<Page<IFileEntry<'client'>>>( `${rootPath}/volumes/${volumeId}` + makeQueryString( options as any ) );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IFileEntry<'client'>> ) {
  return putJson<IFileEntry<'client'>>( `${rootPath}/${id}`, token );
}

export async function replaceFile( fileId: string, file: File ) {
  const data = new FormData();
  data.append( 'file', file );

  const resp = await post( `${rootPath}/replace/${fileId}`, data );
  const toRet: IFileEntry<'client'> = await resp.json();
  return toRet;
}

export async function create( volumeId: string, file: File ) {
  const data = new FormData();
  data.append( 'file', file );

  const resp = await post( `${rootPath}/volumes/${volumeId}/upload/`, data );
  const toRet: IFileEntry<'client'> = await resp.json();
  return toRet;
}