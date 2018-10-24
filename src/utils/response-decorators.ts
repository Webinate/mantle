import Factory from '../core/controller-factory';
import { IResponse, ISimpleResponse } from '../types/tokens/standard-tokens';
import * as express from 'express';
import { error as logError } from './logger';
import { Error401, Error403, Error404, StatusError } from './errors';
import { IAuthReq } from '../types/tokens/i-auth-request';
import { UserPrivileges } from '../core/user-privileges';

/**
 * A decorator for transforming an async express function handler.
 * Transforms the promise's response into a serialized json with
 * a 200 response code.
 * @param errCode The type of error code to raise for errors
 */
export function j200( code: number = 200, errCode: number = 500 ) {
  return function( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
    const originalMethod = descriptor.value;

    // Editing the descriptor/value parameter
    descriptor.value = function() {
      const res = arguments[ 1 ] as express.Response;
      const result: Promise<any> | any | null = originalMethod.apply( this, arguments );
      if ( result && result instanceof Promise ) {
        result.then( result => {
          res.setHeader( 'Content-Type', 'application/json' );
          res.status( code ).json( result );
        } ).catch( ( err: Error ) => {

          res.setHeader( 'Content-Type', 'application/json' );
          if ( err instanceof StatusError )
            res.status( err.status );
          else
            res.status( errCode )
          res.statusMessage = encodeURIComponent( err.message );
          res.json( { message: err.message } );
        } );
      }
    };

    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  }
}

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

/**
 * Helper function to return a status 200 json object of type T
 */
export function okJson<T extends IResponse>( data: T, res: express.Response ) {
  res.setHeader( 'Content-Type', 'application/json' );
  res.end( JSON.stringify( data ) );
}

/**
 * Helper function to return a status 500 json object of type T
 */
export function errJson( err: Error, res: express.Response ) {
  logError( err.message );

  if ( err instanceof Error401 )
    res.status( 401 );
  else if ( err instanceof Error403 )
    res.status( 403 );
  else if ( err instanceof Error404 )
    res.status( 404 );
  else
    res.status( 500 );

  res.statusMessage = err.message;
  res.setHeader( 'Content-Type', 'application/json' );
  const response: ISimpleResponse = { message: err.message };
  res.end( JSON.stringify( response ) );
}