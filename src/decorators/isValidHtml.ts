import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
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

export function IsValidHtml(
  throwsError = true,
  allowedAttributes = defaultAllowedAttributes,
  allowedTags = defaultTags,
  validationOptions?: ValidationOptions
) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidHtml',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [throwsError, allowedAttributes, allowedTags],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [throwsError, allowedAttributes, allowedTags] = args.constraints;
          const errorBadHTML: boolean = throwsError;

          const sanitizedHTML = sanitizeHtml(value, {
            allowedAttributes,
            allowedTags
          }).trim();

          if (errorBadHTML) {
            if (value !== sanitizedHTML) return false;
          } else {
            (args.object as any)[propertyName] = sanitizedHTML;
          }

          return true;
        }
      }
    });
  };
}
