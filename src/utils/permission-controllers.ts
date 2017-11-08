import { ISimpleResponse, IAuthReq } from 'modepress';
import * as express from 'express';
import * as mongodb from 'mongodb';
import { UserPrivileges, User } from '../core/user';
import Factory from '../core/controller-factory';
import { errJson } from './response-decorators';
import { Error401, Error403 } from './errors';

/**
 * Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IMessage if no ID is detected, or its invalid
 * @param idName The name of the ID to check for
 * @param optional If true, then an error wont be thrown if it doesnt exist
 */
export function hasId( idName: string, idLabel: string = '', optional: boolean = false ) {
  return function( req: express.Request, res: express.Response, next: Function ) {
    // Make sure the id
    if ( !req.params[ idName ] && !optional )
      return errJson( new Error( `Please specify an ${!idLabel || idLabel === '' ? idLabel : idName}` ), res );

    // Make sure the id format is correct
    else if ( req.params[ idName ] && !mongodb.ObjectID.isValid( req.params[ idName ] ) ) {
      return errJson( new Error( `Invalid ID format` ), res );
    }

    next();
  }
}

function hasPermission( user: User, level: number, existingUser?: string ): boolean {
  if ( existingUser !== undefined ) {
    if ( ( user.dbEntry.email !== existingUser && user.dbEntry.username !== existingUser ) && user.dbEntry.privileges! > level )
      return false;
  }
  else if ( user.dbEntry.privileges! > level )
    return false;

  return true;
}

/**
 * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
 */
export async function canEdit( req: IAuthReq, res: express.Response, next?: Function ) {
  const targetUser: string = req.params.user;

  try {
    const session = await Factory.get( 'sessions' ).getSession( req );

    if ( !session )
      throw new Error401( 'You must be logged in to make this request' );

    if ( session )
      await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

    let target: User | null = null;

    // Check if the target user exists
    if ( targetUser !== undefined ) {
      target = await Factory.get( 'users' ).getUser( targetUser );
      if ( !target )
        throw new Error( `User ${targetUser} does not exist` );
    }


    else if ( !hasPermission( session.user, 2, targetUser ) )
      throw new Error403( 'You do not have permission' );
    else {
      req._user = session.user.dbEntry;
      if ( next )
        next();

      return;
    }

  } catch ( error ) {
    res.setHeader( 'Content-Type', 'application/json' );
    res.status( 500 )
    const response: ISimpleResponse = { message: error.message };
    res.end( JSON.stringify( response ) );
  };
}

/**
 * Checks if the request has owner rights (admin/owner). If not, an error is sent back to the user
 */
export function ownerRights( req: IAuthReq, res: express.Response, next?: Function ): any {
  const username = req.params.username || req.params.user;
  requestHasPermission( UserPrivileges.Admin, req, res, username ).then( function() {
    if ( next )
      next();

  } ).catch( function( error: Error ) {
    return errJson( error, res );
  } );
}

/**
 * Checks if the request has admin rights. If not, an error is sent back to the user
 */
export async function adminRights( req: IAuthReq, res: express.Response, next?: Function ) {
  try {
    const session = await Factory.get( 'sessions' ).getSession( req );

    if ( !session )
      return errJson( new Error401( 'You must be logged in to make this request' ), res );

    if ( session )
      await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

    req._user = session.user.dbEntry;
    if ( session.user.dbEntry.privileges! > UserPrivileges.Admin )
      return errJson( new Error403( `You don't have permission to make this request` ), res );
    else
      if ( next )
        next();
  }
  catch ( err ) {
    if ( next )
      next( err );
  }
}

/**
 * Checks for session data and fetches the user. Does not throw an error if the user is not present.
 */
export async function identifyUser( req: IAuthReq, res: express.Response, next?: Function ) {

  try {
    const session = await Factory.get( 'sessions' ).getSession( req );

    if ( session )
      await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

    if ( session )
      req._user = session.user.dbEntry;

    if ( next )
      next();

  }
  catch ( err ) {
    if ( next )
      next( err );
  }
}

/**
 * Checks for session data and fetches the user. Sends back an error if no user present
 */
export async function requireUser( req: IAuthReq, res: express.Response, next?: Function ) {
  try {
    const session = await Factory.get( 'sessions' ).getSession( req );

    if ( !session )
      return errJson( new Error401( `You must be logged in to make this request` ), res );

    if ( session )
      await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

    req._user = session.user.dbEntry;
    if ( next )
      next();

  }
  catch ( err ) {
    if ( next )
      next( err );
  }
}

/**
 * Checks a user is logged in and has permission
 * @param level
 * @param req
 * @param res
 * @param existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
 * @param next
 */
export async function requestHasPermission( level: UserPrivileges, req: IAuthReq, res: express.Response, existingUser?: string ): Promise<boolean> {
  const session = await Factory.get( 'sessions' ).getSession( req );

  if ( !session )
    throw new Error401( 'You must be logged in to make this request' );

  if ( session )
    await Factory.get( 'sessions' ).setSessionHeader( session, req, res );

  if ( existingUser !== undefined ) {
    if ( (
      session.user.dbEntry.email !== existingUser &&
      session.user.dbEntry.username !== existingUser ) &&
      session.user.dbEntry.privileges! > level )
      throw new Error403( 'You don\'t have permission to make this request' );
  }
  else if ( session.user.dbEntry.privileges! > level )
    throw new Error403( 'You don\'t have permission to make this request' );

  req._user = session.user.dbEntry;

  return true;
}