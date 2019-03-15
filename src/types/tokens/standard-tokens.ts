import { IUserEntry } from '../models/i-user-entry';
import { IMessage } from './i-message';

/*
 * The most basic response from the server. The base type of all responses.
 */
export interface IResponse {}

export interface ISimpleResponse extends IResponse {
  message: string;
}

/*
 * A response for when bulk items are deleted
 */
export interface IRemoveResponse extends IResponse {
  itemsRemoved: Array<{ id: string; error: boolean; errorMsg: string }>;
}

/*
 * A GET request that returns the status of a user's authentication
 */
export interface IAuthenticationResponse extends IResponse {
  message: string;
  authenticated: boolean;
  user?: IUserEntry<'client' | 'expanded'> | null;
}

/*
 * A GET request that returns an array of data items
 */
export interface Page<T> {
  count: number;
  data: Array<T>;
  index: number;
  limit: number;
}

export namespace EmailTokens {
  /** POST /message-admin */
  export namespace Post {
    export type Body = IMessage;
    export type Response = boolean;
  }
}
