import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as sanitizeHtml from 'sanitize-html';
import { defaultTags, defaultAllowedAttributes } from '../controllers/build-html';

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
