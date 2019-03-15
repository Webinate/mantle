import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
import { IPost } from '../types/models/i-post';
import { Page } from '../types/tokens/standard-tokens';
import { PostsGetAllOptions } from '../controllers/posts';
import { IDraft } from '../types/models/i-draft';

const rootPath = `${apiUrl}/posts`;

export async function getAll(options: Partial<PostsGetAllOptions>) {
  const page = await getJson<Page<IPost<'client' | 'expanded'>>>(rootPath + makeQueryString(options));
  return page;
}

export async function getDrafts(postId: string) {
  const drafts = await getJson<IDraft<'expanded'>[]>(`${rootPath}/${postId}/drafts`);
  return drafts;
}

export function removeDraft(postId: string, draftId: string) {
  return del(`${rootPath}/${postId}/drafts/${draftId}`);
}

export async function getOne(options: { id: string; verbose?: boolean; includeDocument?: boolean }) {
  const page: IPost<'client' | 'expanded'> = await getJson<IPost<'client' | 'expanded'>>(
    `${rootPath}/${options.id}${makeQueryString({ verbose: options.verbose, document: options.includeDocument })}`
  );
  return page;
}

export async function getBySlug(options: { slug: string; verbose?: boolean; includeDocument?: boolean }) {
  const page: IPost<'client' | 'expanded'> = await getJson<IPost<'client' | 'expanded'>>(
    `${rootPath}/s/${options.slug}${makeQueryString({ verbose: options.verbose, document: options.includeDocument })}`
  );
  return page;
}

export function remove(id: string) {
  return del(`${rootPath}/${id}`);
}

export function update(id: string, token: Partial<IPost<'client' | 'expanded'>>) {
  return putJson<IPost<'client' | 'expanded'>>(`${rootPath}/${id}`, token);
}

export function create(token: Partial<IPost<'client' | 'expanded'>>) {
  return postJson<IPost<'client' | 'expanded'>>(rootPath, token);
}
