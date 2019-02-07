import { IDraftElement, IImageElement } from '../types/models/i-draft-elements';
import { IFileEntry } from '../types/models/i-file-entry';

export function buildHtml( elm: IDraftElement<'client' | 'server' | 'expanded'> ) {

  if ( elm.type === 'elm-image' ) {
    const image = ( elm as IImageElement<'client'> ).image;
    if ( image )
      return `<figure><img src="${( image as IFileEntry<'client'> ).publicURL}" /></figure>`;
    else
      return '<figure>Image not found</figure>';
  }

  return elm.html;
}