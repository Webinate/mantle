/// <reference types="express" />
import { Request } from 'express';
import { IUserEntry } from '../models/i-user-entry';
/**
 * An interface used to describe requests that have been authenticated by a session id
 */
export interface IAuthReq extends Request {
    _user: IUserEntry | null;
    _target: IUserEntry | null;
}
