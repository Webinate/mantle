import * as express from 'express';
import { UsersService } from './users-service';
import * as mongodb from 'mongodb';
import * as def from 'webinate-users';
import { UserManager, UserPrivileges } from './users';

/**
 * This funciton checks if user is logged in
 */
export function getUser( req: express.Request, res: express.Response, next?: Function ) {

    const users = UsersService.getSingleton();
    users.authenticated( req ).then( function( auth ) {
        if ( !auth.authenticated ) {
            ( <Modepress.IAuthReq><Express.Request>req )._user = null;
            ( <Modepress.IAuthReq><Express.Request>req )._isAdmin = false;
            ( <Modepress.IAuthReq><Express.Request>req )._verbose = false;
        }
        else {
            ( <Modepress.IAuthReq><Express.Request>req )._user = auth.user!;
            ( <Modepress.IAuthReq><Express.Request>req )._isAdmin = ( auth.user!.privileges === 1 || auth.user!.privileges === 2 ? true : false );


            // Check if this must be cleaned or not
            let verbose = ( req.query.verbose ? true : false );
            if ( verbose )
                if ( !( <Modepress.IAuthReq><Express.Request>req )._isAdmin )
                    if ( req.params.user !== undefined && req.params.user !== auth.user!.username )
                        verbose = false;

            ( <Modepress.IAuthReq><Express.Request>req )._verbose = verbose;

        }

        if ( next )
            next();

    } ).catch( function() {
        req.params.user = null;
        if ( next )
            next();
    } );
}

/**
 * Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IResponse if no ID is detected, or its invalid
 * @param idName The name of the ID to check for
 * @param optional If true, then an error wont be thrown if it doesnt exist
 */
export function hasId( idName: string, idLabel: string = '', optional: boolean = false ) {
    return function( req: express.Request, res: express.Response, next: Function ) {
        // Make sure the id
        if ( !req.params[ idName ] && !optional ) {
            res.setHeader( 'Content-Type', 'application/json' );
            return res.end( JSON.stringify( <Modepress.IResponse>{
                error: true,
                message: 'Please specify an ' + ( !idLabel || idLabel === '' ? idLabel : idName )
            } ) );
        }
        // Make sure the id format is correct
        else if ( req.params[ idName ] && !mongodb.ObjectID.isValid( req.params[ idName ] ) ) {
            res.setHeader( 'Content-Type', 'application/json' );
            return res.end( JSON.stringify( <Modepress.IResponse>{
                error: true,
                message: 'Invalid ID format'
            } ) );
        }

        next();
    }
}

/**
 * Checks for if a user with the username or email of the queryName exists. Throws an error if they don't
 * @param queryName The name of the ID to check for
 * @param rejectName The textual name of the ID when its rejected
 */
export async function userExists( req: express.Request, res: express.Response, next?: Function ) {
    try {
        const users = UsersService.getSingleton();
        const user = await users.getUser( req.params.user, req )

        // Make sure the id format is correct
        if ( !user )
            throw new Error( 'User does not exist' );

        if ( next )
            next()
    }
    catch ( err ) {
        res.setHeader( 'Content-Type', 'application/json' );
        return res.end( JSON.stringify( <Modepress.IResponse>{
            error: true,
            message: err.message
        } ) );
    }
}

/**
 * This funciton checks the logged in user is an admin. If not an admin it returns an error,
 * if true it passes the scope onto the next function in the queue
 */
export function isAdmin( req: express.Request, res: express.Response, next?: Function ) {
    const users = UsersService.getSingleton();

    users.authenticated( req ).then( function( auth ) {
        if ( !auth.authenticated )
            throw new Error( 'You must be logged in to make this request' );
        else if ( !users.isAdmin( auth.user! ) )
            throw new Error( 'You do not have permission' );
        else {
            ( <Modepress.IAuthReq><Express.Request>req )._user = auth.user!;
            ( <Modepress.IAuthReq><Express.Request>req )._isAdmin = ( auth.user!.privileges === 1 || auth.user!.privileges === 2 ? true : false );
            ( <Modepress.IAuthReq><Express.Request>req )._verbose = true;

            if ( next )
                next();
        }

    } ).catch( function( error: Error ) {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( <Modepress.IResponse>{
            error: true,
            message: error.message
        } ) );
    } );
}

/**
 * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
 */
export async function canEdit( req: express.Request, res: express.Response, next?: Function ) {
    const users = UsersService.getSingleton();
    const targetUser: string = req.params.user;

    try {
        const auth = await users.authenticated( req );
        let target: UsersInterface.IGetUser | null = null;

        // Check if the target user exists
        if ( targetUser !== undefined ) {
            target = await users.getUser( targetUser, req );
            if ( !target )
                throw new Error( `User ${targetUser} does not exist` );
            if ( target && target.error )
                throw new Error( target.message );
        }

        if ( !auth.authenticated )
            throw new Error( 'You must be logged in to make this request' );
        else if ( !users.hasPermission( auth.user!, 2, targetUser ) )
            throw new Error( 'You do not have permission' );
        else {
            ( <Modepress.IAuthReq><Express.Request>req )._user = auth.user!;
            ( <Modepress.IAuthReq><Express.Request>req )._isAdmin = ( auth.user!.privileges === 1 || auth.user!.privileges === 2 ? true : false );
            ( <Modepress.IAuthReq><Express.Request>req )._verbose = ( req.query.verbose ? true : false );

            if ( next )
                next();

            return;
        }

    } catch ( error ) {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( <Modepress.IResponse>{
            error: true,
            message: error.message
        } ) );
    };
}

/**
 * This funciton checks if user is logged in and throws an error if not
 */
export function isAuthenticated( req: express.Request, res: express.Response, next?: Function ) {
    const users = UsersService.getSingleton();
    users.authenticated( req ).then( function( auth ) {
        if ( !auth.authenticated )
            throw new Error( auth.message );

        ( <Modepress.IAuthReq><Express.Request>req )._user = auth.user!;
        ( <Modepress.IAuthReq><Express.Request>req )._isAdmin = ( auth.user!.privileges === 1 || auth.user!.privileges === 2 ? true : false );

        // Check if this must be cleaned or not
        let verbose = ( req.query.verbose ? true : false );
        if ( verbose )
            if ( !( <Modepress.IAuthReq><Express.Request>req )._isAdmin )
                if ( req.params.user !== undefined && req.params.user !== auth.user!.username )
                    verbose = false;

        ( <Modepress.IAuthReq><Express.Request>req )._verbose = verbose;

        if ( next )
            next();

    } ).catch( function( error: Error ) {
        res.setHeader( 'Content-Type', 'application/json' );
        res.end( JSON.stringify( <Modepress.IResponse>{
            error: true,
            message: error.message
        } ) );
    } );
}


/**
 * Checks if the request has owner rights (admin/owner). If not, an error is sent back to the user
 */
export function ownerRights( req: def.AuthRequest, res: express.Response, next?: Function ): any {
    const username = req.params.username || req.params.user;
    requestHasPermission( UserPrivileges.Admin, req, res, username ).then( function() {
        if ( next )
            next();

    } ).catch( function( error: Error ) {
        res.setHeader( 'Content-Type', 'application/json' );
        return res.end( JSON.stringify( <def.IResponse>{
            message: error.message,
            error: true
        } ) );
    } );
}

/**
 * Checks if the request has admin rights. If not, an error is sent back to the user
 */
export function adminRights( req: def.AuthRequest, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( <express.Request><Express.Request>req, res ).then( function( user ) {
        if ( !user )
            return res.end( JSON.stringify( <def.IResponse>{ message: 'You must be logged in to make this request', error: true } ) );

        req._user = user;
        if ( user.dbEntry.privileges! > UserPrivileges.Admin )
            return res.end( JSON.stringify( <def.IResponse>{ message: 'You don\'t have permission to make this request', error: true } ) );
        else
            if ( next )
                next();
    } );
}

/**
 * Checks for session data and fetches the user. Does not throw an error if the user is not present.
 */
export function identifyUser( req: def.AuthRequest, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( <express.Request><Express.Request>req, res ).then( function() {
        req._user = null;
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
export function requireUser( req: def.AuthRequest, res: express.Response, next?: Function ): any {
    UserManager.get.loggedIn( <express.Request><Express.Request>req, res ).then( function( user ) {
        if ( !user ) {
            res.setHeader( 'Content-Type', 'application/json' );
            return res.end( JSON.stringify( <def.IResponse>{
                message: 'You must be logged in to make this request',
                error: true
            } ) );
        }

        req._user = user;
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
export async function requestHasPermission( level: UserPrivileges, req: def.AuthRequest, res: express.Response, existingUser?: string ): Promise<boolean> {
    const user = await UserManager.get.loggedIn( <express.Request><Express.Request>req, res );

    if ( !user )
        throw new Error( 'You must be logged in to make this request' );

    if ( existingUser !== undefined ) {
        if ( ( user.dbEntry.email !== existingUser && user.dbEntry.username !== existingUser ) && user.dbEntry.privileges! > level )
            throw new Error( 'You don\'t have permission to make this request' );
    }
    else if ( user.dbEntry.privileges! > level )
        throw new Error( 'You don\'t have permission to make this request' );

    req._user = user;

    return true;
}