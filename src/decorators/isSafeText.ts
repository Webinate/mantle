import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as sanitizeHtml from 'sanitize-html';

export function IsSafeText(throwsError = false, validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidHtml',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [throwsError],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [throwsError] = args.constraints;
          const errorBadHTML: boolean = throwsError;

          const sanitizedHTML = sanitizeHtml(value, {
            allowedTags: []
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
