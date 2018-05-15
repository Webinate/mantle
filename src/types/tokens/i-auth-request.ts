import { Request } from 'express';
import { IUserEntry } from '../models/i-user-entry';

/**
 * An interface used to describe requests that have been authenticated by a session id
 */
export interface IAuthReq extends Request {
  _user: IUserEntry<'server'> | null;
  _target: IUserEntry<'server'> | null;
}
