import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { IUserEntry } from '../types/models/i-user-entry';
import { Page } from '../types/tokens/standard-tokens';
import { UsersGetAllOptions } from '../core/types';

const rootPath = `${apiUrl}/users`;

export async function getAll(options: Partial<UsersGetAllOptions>) {
  const page = await getJson<Page<IUserEntry<'client' | 'expanded'>>>(rootPath + makeQueryString(options));
  return page;
}

export async function getOne(options: { user: string; verbose?: boolean }) {
  const page = await getJson<IUserEntry<'client' | 'expanded'>>(
    `${rootPath}/${options.user}${options.verbose ? makeQueryString({ verbose: true }) : ''}`
  );
  return page;
}

export function remove(user: string) {
  return del(`${rootPath}/${user}`);
}

export function update(user: string, token: Partial<IUserEntry<'client' | 'expanded'>>) {
  return putJson<IUserEntry<'client' | 'expanded'>>(`${rootPath}/${user}`, token);
}

export function create(token: Partial<IUserEntry<'client' | 'expanded'>>) {
  return postJson<IUserEntry<'client' | 'expanded'>>(rootPath, token);
}
