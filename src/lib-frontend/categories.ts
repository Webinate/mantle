import { getJson, makeQueryString, del, postJson, apiUrl } from './http-clients';
import { ICategory } from '../types/models/i-category';
import { Page } from '../types/tokens/standard-tokens';

const rootPath = `${apiUrl}/categories`;

export type GetAllOptions = {
  index: number;
  limit: number;
  verbose: boolean;
}

export async function getAll( options: Partial<GetAllOptions> ) {
  const page = await getJson<Page<ICategory>>( rootPath + makeQueryString( options ) );
  return page;
}

export function remove( id: string ) {
  return del( `${rootPath}/${id}` );
}

export function create( token: Partial<ICategory> ) {
  return postJson<ICategory>( rootPath, token );
}