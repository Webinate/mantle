import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { IPost } from '../types/models/i-post';
import { Page } from '../types/tokens/standard-tokens';

const rootPath = `${apiUrl}/posts`;

export type GetAllOptions = {
  visibility: 'all' | 'public' | 'private';
  categories: string[];
  tags: string[];
  rtags: string[];
  sort: boolean;
  index: number;
  limit: number;
  keyword: string;
  author: string;
  sortOrder: 'asc' | 'desc';
  minimal: boolean;
  verbose: boolean;
}

export async function getAll( options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<IPost>>( rootPath + makeQueryString( options ) );
  return page;
}

export async function getOne( options: { id: string; verbose?: boolean; } ) {
  const page: IPost = await getJson<IPost>( `${rootPath}/${options.id}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export async function getBySlug( options: { slug: string; verbose?: boolean; } ) {
  const page: IPost = await getJson<IPost>( `${rootPath}/slug/${options.slug}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function update( id: string, token: Partial<IPost> ) {
  return putJson<IPost>( `${rootPath}/${id}`, token );
}

export function create( token: Partial<IPost> ) {
  return postJson<IPost>( rootPath, token );
}