import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IComment } from '..';

const rootPath = `${apiUrl}/comments`;

export type GetAllOptions = {
  visibility: 'all' | 'public' | 'private';
  sort: string;
  user: string;
  index: number;
  depth: number;
  limit: number;
  expanded: boolean;
  keyword: string;
  parentId: string;
  sortOrder: 'asc' | 'desc';
  verbose: boolean;
}

export async function getAll( options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IComment>>( rootPath + makeQueryString( options ) );
  return page;
}

export async function getAllFromParent( parentId: string, options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IComment>>( `${apiUrl}/nested-comments/${parentId}` + makeQueryString( options ) );
  return page;
}

export async function getAllFromUser( user: string, options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IComment>>( `${apiUrl}/users/${user}/comments` + makeQueryString( options ) );
  return page;
}

export async function getOne( id: string, options: { expanded?: boolean; verbose?: boolean; } ) {
  const page = await getJson<IComment>( `${rootPath}/${id}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IComment> ) {
  return putJson<IComment>( `${rootPath}/${id}`, token );
}

export function create( postId: string, token: Partial<IComment>, parentId?: string ) {
  return postJson<IComment>( `${apiUrl}/posts/${postId}/comments${parentId ? '/' + parentId : ''}`, token );
}