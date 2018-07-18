'use strict';

import { IResponse, ISimpleResponse } from '../types/tokens/standard-tokens';
import * as express from 'express';
import { error as logError } from './logger';
import { Error401, Error403, Error404 } from './errors';

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
          res.status( errCode )
          res.statusMessage = err.message;
          res.json( { message: err.message } );
        } );
      }
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