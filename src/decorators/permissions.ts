import Factory from '../core/controller-factory';
import * as express from 'express';
import { Error401, Error403 } from '../utils/errors';
import { IAuthReq } from '../types/tokens/i-auth-request';
import { UserPrivileges } from '../core/user-privileges';

/**
 * Checks if the request is a logged in user. If not then a 400 error is thrown
 * for either permission (403) or lack of authorization (401)
 */
export function admin() {
  return function( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function() {
      const req = arguments[ 0 ] as IAuthReq;
      const res = arguments[ 1 ] as express.Response;
      const session = await Factory.get( 'sessions' ).getSession( req );

      if ( !session )
        throw new Error401( 'You must be logged in to make this request' );

      if ( session )
        await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

      req._user = session.user;
      req._isAdmin = session.user.privileges <= UserPrivileges.Admin;

      if ( session.user.privileges! > UserPrivileges.Admin )
        throw new Error403( `You don't have permission to make this request` );

      const result = originalMethod.apply( this, arguments );
      return result;
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  }
}