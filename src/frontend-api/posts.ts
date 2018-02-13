import { getJson, makeQueryString, del, putJson, postJson } from './http-clients';
import { IPost } from '../types/models/i-post';
import { Page } from '../types/tokens/standard-tokens';

export async function getAll( options: Partial<{
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
}> ) {
  const page = await getJson<Page<IPost>>( '/posts' + makeQueryString( options ) );
  return page;
}

export async function getOne( options: { id: string; verbose?: boolean; } ) {
  const page: IPost = await getJson<IPost>( `/posts/${options.id}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export async function getBySlug( options: { slug: string; verbose?: boolean; } ) {
  const page: IPost = await getJson<IPost>( `/posts/slug/${options.slug}${options.verbose ? makeQueryString( { verbose: true } ) : ''}` );
  return page;
}

export function remove( id: string ) {
  return del( `/posts/${id}` );
}

export function update( id: string, token: Partial<IPost> ) {
  return putJson<IPost>( `/posts/${id}`, token );
}

export function create( token: Partial<IPost> ) {
  return postJson<IPost>( `/posts`, token );
}