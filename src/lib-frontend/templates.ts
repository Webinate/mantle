import { getJson, apiUrl } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { ITemplate } from '../types/models/i-template';

const rootPath = `${apiUrl}/templates`;

export async function getAll() {
  const page = await getJson<Page<ITemplate<'client' | 'expanded'>>>( rootPath );
  return page;
}

export async function getOne( id: string ) {
  const template = await getJson<ITemplate<'client' | 'expanded'>>( `${rootPath}/${id}` );
  return template;
}