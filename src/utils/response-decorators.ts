import { IResponse, ISimpleResponse } from '../types/tokens/standard-tokens';
import * as express from 'express';
import { error as logError } from './logger';
import { Error401, Error403, Error404 } from './errors';

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