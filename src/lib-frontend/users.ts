import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { IUserEntry } from '../types/models/i-user-entry';
import { Page } from '../types/tokens/standard-tokens';

const rootPath = `${apiUrl}/users`;

export type GetAllOptions = {
  search: string;
  index: number;
  limit: number;
  verbose: boolean;
}

export async function getAll( options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IUserEntry>>( rootPath + makeQueryString( options ) );
  return page;
}

export async function getOne( options: { user: string; verbose?: boolean; } ) {
  const page = await getJson<IUserEntry>( `${rootPath}/${options.user}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export function remove( user: string ) {
  return del( `${rootPath}/${user}` );
}

export function update( user: string, token: Partial<IUserEntry> ) {
  return putJson<IUserEntry>( `${rootPath}/${user}`, token );
}

export function create( token: Partial<IUserEntry> ) {
  return postJson<IUserEntry>( rootPath, token );
}