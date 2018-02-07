/// <reference types="express" />
import { IAuthReq } from '../types/tokens/i-auth-request';
import * as express from 'express';
import { UserPrivileges } from '../core/user';
/**
 * Checks for an id parameter and that its a valid mongodb ID. Returns an error of type IMessage if no ID is detected, or its invalid
 * @param idName The name of the ID to check for
 * @param optional If true, then an error wont be thrown if it doesnt exist
 */
export declare function hasId(idName: string, idLabel?: string, optional?: boolean): (req: express.Request, res: express.Response, next: Function) => void;
/**
 * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
 */
export declare function canEdit(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
/**
 * Checks if the request has owner rights (admin/owner). If not, an error is sent back to the user
 */
export declare function ownerRights(req: IAuthReq, res: express.Response, next?: Function): any;
/**
 * Checks if the request has admin rights. If not, an error is sent back to the user
 */
export declare function adminRights(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
/**
 * Checks for session data and fetches the user. Does not throw an error if the user is not present.
 */
export declare function identifyUser(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
/**
 * Checks for session data and fetches the user. Sends back an error if no user present
 */
export declare function requireUser(req: IAuthReq, res: express.Response, next?: Function): Promise<void>;
/**
 * Checks a user is logged in and has permission
 * @param level
 * @param req
 * @param res
 * @param existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
 * @param next
 */
export declare function requestHasPermission(level: UserPrivileges, req: IAuthReq, res: express.Response, existingUser?: string): Promise<boolean>;
