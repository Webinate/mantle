// import { getJson, makeQueryString, del, putJson, postJson, apiUrl } from './http-clients';
// import { Page } from '../types/tokens/standard-tokens';
// import { IComment } from '..';
// import { CommentGetAllOptions } from '../core/types';

// const rootPath = `${apiUrl}/comments`;

// export async function getAll(options: Partial<CommentGetAllOptions>) {
//   const page = await getJson<Page<IComment<'client' | 'expanded'>>>(rootPath + makeQueryString(options));
//   return page;
// }

// export async function getAllFromParent(parentId: string, options: Partial<CommentGetAllOptions>) {
//   const page = await getJson<Page<IComment<'client' | 'expanded'>>>(
//     `${apiUrl}/nested-comments/${parentId}` + makeQueryString(options)
//   );
//   return page;
// }

// export async function getAllFromUser(user: string, options: Partial<CommentGetAllOptions>) {
//   const page = await getJson<Page<IComment<'client' | 'expanded'>>>(
//     `${apiUrl}/users/${user}/comments` + makeQueryString(options)
//   );
//   return page;
// }

// export async function getOne(id: string, options: { expanded?: boolean; verbose?: boolean }) {
//   const page = await getJson<IComment<'client' | 'expanded'>>(
//     `${rootPath}/${id}${options.verbose ? makeQueryString({ verbose: true }) : ''}`
//   );
//   return page;
// }

// export function remove(id: string) {
//   return del(`${rootPath}/${id}`);
// }

// export function update(id: string, token: Partial<IComment<'client'>>) {
//   return putJson<IComment<'client' | 'expanded'>>(`${rootPath}/${id}`, token);
// }

// export function create(postId: string, token: Partial<IComment<'client'>>, parentId?: string) {
//   return postJson<IComment<'client' | 'expanded'>>(
//     `${apiUrl}/posts/${postId}/comments${parentId ? '/' + parentId : ''}`,
//     token
//   );
// }
