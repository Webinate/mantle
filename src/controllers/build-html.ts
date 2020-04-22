import { IDraftElement, IImageElement } from '../types/models/i-draft-elements';
import { IFileEntry } from '../types/models/i-file-entry';
import ControllerFactory from '../core/controller-factory';
import { ElementType } from '../core/enums';

function createStyleString(json: any | undefined) {
  if (!json) return '';

  const styleKeys = Object.keys(json);
  if (styleKeys.length === 0) return '';

  const styleStr = styleKeys.map(key => `${key}:${json[key]}`).join(';');

  return ` style="${styleStr}"`;
}

export async function buildHtml(elm: IDraftElement<'client' | 'server' | 'expanded'>) {
  if (elm.type === ElementType.image) {
    const imageElm = elm as IImageElement<'client'>;
    const image = imageElm.image;

    if (image && typeof image !== 'string')
      return `<figure${createStyleString(imageElm.style)}><img src="${
        (image as IFileEntry<'client'>).publicURL
      }" /></figure>`;
    else if (image) {
      const file = await ControllerFactory.get('files').getFile(image);
      return `<figure${createStyleString(imageElm.style)}><img src="${file.publicURL}" /></figure>`;
    } else {
      return '<figure>Image not found</figure>';
    }
  }

  return elm.html;
}
