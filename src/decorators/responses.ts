import * as express from 'express';
import { StatusError } from '../utils/errors';

/**
 * A decorator for transforming an async express function handler.
 * Transforms the promise's response into a serialized json with
 * a 200 response code.
 * @param code The success code (defaults to 200)
 * @param errCode The type of error code to raise for unrecognised errors
 */
export function j200(code: number = 200, errCode: number = 500) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // Editing the descriptor/value parameter
    descriptor.value = function() {
      const res = arguments[1] as express.Response;
      const result: Promise<any> | any | null = originalMethod.apply(this, arguments);
      if (result && result instanceof Promise) {
        result
          .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.status(code).json(result);
          })
          .catch((err: Error) => {
            res.setHeader('Content-Type', 'application/json');
            if (err instanceof StatusError) res.status(err.status);
            else res.status(errCode);

            res.statusMessage = encodeURIComponent(err.message);
            res.json({ message: err.message });
          });
      }
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
