import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IVolume } from '../types/models/i-volume-entry';

const rootPath = `${apiUrl}/volumes`;

export type GetAllOptions = {
  search: string;
  index: number;
  limit: number;
}

export async function getAll( options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IVolume<'client'>>>( `${rootPath}` + makeQueryString( options ) );
  return page;
}

export async function getAllForUser( username: string, options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IVolume<'client'>>>( `${rootPath}/user/${username}` + makeQueryString( options ) );
  return page;
}

export async function getOne( id: string ) {
  const page = await getJson<IVolume<'client'>>( `${rootPath}/${id}` );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IVolume<'client'>> ) {
  return putJson<IVolume<'client'>>( `${rootPath}/${id}`, token );
}

export function create( user: string, name: string ) {
  return postJson<IVolume<'client'>>( `${rootPath}/user/${user}/${name}`, {} );
}