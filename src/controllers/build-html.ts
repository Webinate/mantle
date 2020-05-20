import { IDraftElement, IImageElement } from '../types/models/i-draft-elements';
import ControllerFactory from '../core/controller-factory';
import { ElementType } from '../core/enums';
// import { inlineTags, defaultAllowedAttributes } from '../decorators/isValidHtml';
import * as sanitizeHtml from 'sanitize-html';

/**
 * The default allowed attributes for each tag
 */
export const defaultAllowedAttributes: { [name: string]: Array<string> } = {
  a: ['href', 'name', 'target'],
  img: ['src', 'style', 'width', 'height', 'id', 'class'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
};

/**
 * The default tags allowed
 * includes: h3, h4, h5, h6, blockquote, p, a, ul, ol,
 *    nl, li, b, i, strong, em, strike, code, hr, br, div,
 *    table, thead, caption, tbody, tr, th, td, pre
 */
export const defaultTags: Array<string> = [
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'p',
  'a',
  'ul',
  'ol',
  'nl',
  'li',
  'b',
  'i',
  'strong',
  'em',
  'strike',
  'code',
  'hr',
  'br',
  'div',
  'iframe',
  'table',
  'thead',
  'caption',
  'tbody',
  'tr',
  'th',
  'td',
  'pre',
  'span'
];

/**
 * An array of common inline tags
 * includes: a, b, i, strong, em, u, strike, hr, br
 */
export const inlineTags: Array<string> = [
  'a',
  'b',
  'i',
  'strong',
  'em',
  'u',
  'blockquote',
  'strike',
  'hr',
  'br',
  'span'
];

function createStyleString(json: any | undefined) {
  if (!json) return '';

  const styleKeys = Object.keys(json);
  if (styleKeys.length === 0) return '';

  const styleStr = styleKeys.map(key => `${key}:${json[key]}`).join(';');

  return ` style="${styleStr}"`;
}

export function transformElmHtml(token: Partial<IDraftElement<'server'>>) {
  let tags: string[] = [];
  let attributes = defaultAllowedAttributes;

  if (token.type === ElementType.code) tags = inlineTags.concat(['pre']);
  else if (token.type === ElementType.paragraph) tags = inlineTags.concat([]);
  else if (token.type === ElementType.header1) tags = inlineTags.concat(['h1']);
  else if (token.type === ElementType.header2) tags = inlineTags.concat(['h2']);
  else if (token.type === ElementType.header3) tags = inlineTags.concat(['h3']);
  else if (token.type === ElementType.header4) tags = inlineTags.concat(['h4']);
  else if (token.type === ElementType.header5) tags = inlineTags.concat(['h5']);
  else if (token.type === ElementType.header6) tags = inlineTags.concat(['h6']);
  else if (token.type === ElementType.list) tags = inlineTags.concat(['ul', 'ol', 'li']);
  else return token.html!;

  const sanitizedHTML = sanitizeHtml(token.html!, {
    allowedAttributes: attributes,
    allowedTags: tags
  }).trim();

  if (token.type === ElementType.paragraph) return `<p>${sanitizedHTML}</p>`;

  return sanitizedHTML;
}

export async function buildHtml(elm: IDraftElement<'server'>) {
  if (elm.type === ElementType.image) {
    const imageElm = elm as IImageElement<'server'>;
    const image = imageElm.image;

    if (image) {
      const file = await ControllerFactory.get('files').getFile(image);
      if (file) return `<figure${createStyleString(imageElm.style)}><img src="${file.publicURL}" /></figure>`;
      else return '<figure>Image not found</figure>';
    } else {
      return '<figure>Image not found</figure>';
    }
  }

  return elm.html;
}
