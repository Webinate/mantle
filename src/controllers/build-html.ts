import { IDraftElement, IImageElement } from '../types/models/i-draft-elements';
import { IFileEntry } from '../types/models/i-file-entry';

function createStyleString(json: any | undefined) {
  if (!json) return '';

  const styleKeys = Object.keys(json);
  if (styleKeys.length === 0) return '';

  const styleStr = styleKeys.map(key => `${key}:${json[key]}`).join(';');

  return ` style="${styleStr}"`;
}

export function buildHtml(elm: IDraftElement<'client' | 'server' | 'expanded'>) {
  if (elm.type === 'elm-image') {
    const imageElm = elm as IImageElement<'client'>;
    const image = imageElm.image;
    if (image)
      return `<figure${createStyleString(imageElm.style)}><img src="${
        (image as IFileEntry<'client'>).publicURL
      }" /></figure>`;
    else return '<figure>Image not found</figure>';
  }

  return elm.html;
}
