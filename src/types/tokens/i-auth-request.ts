import { Request } from 'express';

declare module 'modepress' {

  /**
   * An interface used to describe requests that have been authenticated by a session id
   */
  export interface IAuthReq extends Request {
    _user: IUserEntry | null;
    _target: IUserEntry | null;
  }
}