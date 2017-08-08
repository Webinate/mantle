import { IResponse, IAuthReq } from 'modepress';
import * as express from 'express';
import * as mongodb from 'mongodb';
import { UserManager, UserPrivileges, User } from '../core/users';
import { errJson } from './serializers';

/**
 * Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IResponse if no ID is detected, or its invalid
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
        const user = await UserManager.get.loggedIn( req, res );

        if ( !user )
            throw new Error( 'You must be logged in to make this request' );


        let target: User | null = null;

        // Check if the target user exists
        if ( targetUser !== undefined ) {
            target = await UserManager.get.getUser( targetUser );
            if ( !target )
                throw new Error( `User ${targetUser} does not exist` );
        }


        else if ( !hasPermission( user, 2, targetUser ) )
            throw new Error( 'You do not have permission' );
        else {
            req._user = user.dbEntry;
            req._isAdmin = ( user.dbEntry.privileges === 1 || user.dbEntry.privileges === 2 ? true : false );
            req._verbose = ( req.query.verbose ? true : false );

            if ( next )
                next();

            return;
        }

    } catch ( error ) {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( <IResponse>{
            error: true,
            message: error.message
        } ) );
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
        return errJson( new Error( error.message ), res );
    } );
}

/**
 * Checks if the request has admin rights. If not, an error is sent back to the user
 */
export function adminRights( req: IAuthReq, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( req, res ).then( function( user ) {
        if ( !user )
            return errJson( new Error( 'You must be logged in to make this request' ), res );

        req._user = user.dbEntry;
        if ( user.dbEntry.privileges! > UserPrivileges.Admin )
            return errJson( new Error( `You don't have permission to make this request` ), res );
        else
            if ( next )
                next();
    } );
}

export function checkVerbosity( req: IAuthReq, res: express.Response, next?: Function ): any {

    // Check if this must be cleaned or not
    let verbose = req.query.verbose ? true : false;
    if ( verbose )
        if ( !req._isAdmin )
            if ( req.params.user !== undefined && req.params.user !== req._user!.username )
                verbose = false;

    req._verbose = verbose;

    if ( next )
        next();
}

/**
 * Checks for session data and fetches the user. Does not throw an error if the user is not present.
 */
export function identifyUser( req: IAuthReq, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( req, res ).then( function( user ) {
        if ( user ) {
            req._user = user.dbEntry;
            req._isAdmin = ( user.dbEntry.privileges! > UserPrivileges.Admin ? true : false );
        }

        if ( next )
            next();

    } ).catch( function() {
        if ( next )
            next();
    } );
}

/**
 * Checks for session data and fetches the user. Sends back an error if no user present
 */
export function requireUser( req: IAuthReq, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( req, res ).then( function( user ) {
        if ( !user )
            return errJson( new Error( `You must be logged in to make this request` ), res );

        req._user = user.dbEntry;
        if ( next )
            next();

    } ).catch( function() {
        if ( next )
            next();
    } );
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
    const user = await UserManager.get.loggedIn( req, res );

    if ( !user )
        throw new Error( 'You must be logged in to make this request' );

    if ( existingUser !== undefined ) {
        if ( ( user.dbEntry.email !== existingUser && user.dbEntry.username !== existingUser ) && user.dbEntry.privileges! > level )
            throw new Error( 'You don\'t have permission to make this request' );
    }
    else if ( user.dbEntry.privileges! > level )
        throw new Error( 'You don\'t have permission to make this request' );

    req._user = user.dbEntry;
    if ( user )
        req._isAdmin = ( user.dbEntry.privileges! > UserPrivileges.Admin ? true : false );

    return true;
}