import { getJson, putJson, postJson, apiUrl, del } from './http-clients';
import { Page } from '../types/tokens/standard-tokens';
import { IDocument } from '../types/models/i-document';
import { IDraftElement } from '../types/models/i-draft-elements';

const rootPath = `${apiUrl}/documents`;

export async function getAll() {
  const page = await getJson<Page<IDocument<'client' | 'expanded'>>>(rootPath);
  return page;
}

export async function getOne(id: string) {
  const doc = await getJson<IDocument<'client' | 'expanded'>>(`${rootPath}/${id}`);
  return doc;
}

export async function setTemplate(docId: string, templateId: string) {
  const doc = await putJson<IDocument<'client' | 'expanded'>>(`${rootPath}/${docId}/set-template/${templateId}`, {});
  return doc;
}

export async function addElement(docId: string, elm: Partial<IDraftElement<'client' | 'expanded'>>, index?: number) {
  const doc = await postJson<IDraftElement<'client' | 'expanded'>>(
    `${rootPath}/${docId}/elements${index !== undefined ? '?index=' + index : ''}`,
    elm
  );
  return doc;
}

export async function editElement(docId: string, elementId: string, elm: Partial<IDraftElement<'client'>>) {
  const doc = await putJson<IDraftElement<'client' | 'expanded'>>(`${rootPath}/${docId}/elements/${elementId}`, elm);
  return doc;
}

export function removeElement(docId: string, elementId: string) {
  return del(`${rootPath}/${docId}/elements/${elementId}`);
}
