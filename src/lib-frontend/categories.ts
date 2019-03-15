import { getJson, makeQueryString, del, postJson, putJson, apiUrl } from './http-clients';
import { ICategory } from '../types/models/i-category';
import { Page } from '../types/tokens/standard-tokens';
import { CategoriesGetManyOptions } from '../controllers/categories';

const rootPath = `${apiUrl}/categories`;

export async function getAll(options: Partial<CategoriesGetManyOptions>) {
  const page = await getJson<Page<ICategory<'client' | 'expanded'>>>(rootPath + makeQueryString(options));
  return page;
}

export function remove(id: string) {
  return del(`${rootPath}/${id}`);
}

export function create(token: Partial<ICategory<'client'>>) {
  return postJson<ICategory<'client' | 'expanded'>>(rootPath, token);
}

export function edit(id: string, token: Partial<ICategory<'client'>>) {
  return putJson<ICategory<'client' | 'expanded'>>(`${rootPath}/${id}`, token);
}
