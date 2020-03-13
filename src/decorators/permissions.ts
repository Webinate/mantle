import Factory from '../core/controller-factory';
import * as express from 'express';
import { Error401, Error403 } from '../utils/errors';
import { IAuthReq } from '../types/tokens/i-auth-request';
import { UserPrivilege } from '../core/enums';
import { IGQLContext } from '../types/interfaces/i-gql-context';

/**
 * Checks if the request is a logged in user. If not then a 400 error is thrown
 * for either permission (403) or lack of authorization (401)
 */
export function isAdminRest() {
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

      if (session.user.privileges! === 'regular') throw new Error403(`You do not have permission`);

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}

/**
 * Checks if the request is a logged in user. If not then a 400 error is thrown
 * for either permission (403) or lack of authorization (401)
 */
export function isAdminGql() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const context = arguments[2] as IGQLContext;
      const session = await Factory.get('sessions').getSession(context.req);

      if (!session) throw new Error401();
      if (session) await Factory.get('sessions').setSessionHeader(session, context.req, context.res);

      context.user = session.user;
      context.isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';

      if (session.user.privileges! === 'regular') throw new Error403(`You do not have permission`);

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}

/**
 * Identifies the user in the request before calling the handler
 */
export function isIdentifiedGql() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const context = arguments[2] as IGQLContext;
      const session = await Factory.get('sessions').getSession(context.req);

      if (session) await Factory.get('sessions').setSessionHeader(session, context.req, context.res);

      if (session) {
        context.user = session.user;
        context.isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';
      }

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}

/**
 * Identifies the user in the request before calling the handler
 */
export function isIdentifiedRest() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const req = arguments[0] as IAuthReq;
      const res = arguments[1] as express.Response;

      const session = await Factory.get('sessions').getSession(req);

      if (session) await Factory.get('sessions').setSessionHeader(session, req, res);

      if (session) {
        req._user = session.user;
        req._isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';
      }

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}

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

/**
 * Checks the request for a user session. If none is present
 * a 401 auth error is thrown
 */
export function isAuthorizedGql() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const context = arguments[2] as IGQLContext;
      const session = await Factory.get('sessions').getSession(context.req);

      if (!session) throw new Error401();
      if (session) await Factory.get('sessions').setSessionHeader(session, context.req, context.res);

      context.user = session.user;
      context.isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}

/**
 * Checks if the user in the path as a certain permission. Throws a 403 if permission are not set
 * @param pathId The path parameter to check for. Usually 'user' or 'username'
 * @param permission The permission to check for
 */
export function hasPermissionRest(pathId?: string, permission: UserPrivilege = UserPrivilege.admin) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const req = arguments[0] as IAuthReq;
      const res = arguments[1] as express.Response;
      const session = await Factory.get('sessions').getSession(req);

      if (!session) throw new Error401();

      if (session) await Factory.get('sessions').setSessionHeader(session, req, res);

      const targetUser = pathId ? req.params[pathId] : undefined;
      const curUser = session.user;
      const permissionScale: { [key in UserPrivilege]: number } = {
        super: 1,
        admin: 2,
        regular: 3
      };

      if (targetUser !== undefined) {
        if (
          curUser.email !== targetUser &&
          curUser.username !== targetUser &&
          permissionScale[curUser.privileges!] > permissionScale[permission]
        )
          throw new Error403();
      } else if (permissionScale[session.user.privileges!] > permissionScale[permission]) throw new Error403();

      req._user = session.user;
      req._isAdmin = session.user.privileges === 'admin' || session.user.privileges === 'super';

      const result = originalMethod.apply(this, arguments);
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  };
}
