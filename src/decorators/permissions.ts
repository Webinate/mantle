import Factory from '../core/controller-factory';
import * as express from 'express';
import { Error401 } from '../utils/errors';
import { IAuthReq } from '../types/tokens/i-auth-request';

/**
 * Checks the request for a user session. If none is present
 * a 401 auth error is thrown
 */
export function isAuthorizedRest() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const req = arguments[0] as IAuthReq;
      const res = arguments[1] as express.Response;

      const session = await Factory.get('sessions').getSession(req);

      if (!session) throw new Error401();

      if (session) await Factory.get('sessions').setSessionHeader(session, req, res);

      req._user = session.user;
      req._isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
