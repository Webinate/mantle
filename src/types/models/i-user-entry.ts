import { ObjectID } from 'mongodb';
import { IFileEntry } from './i-file-entry';

/*
 * An interface to describe the data stored in the database for users
 */
export interface IUserEntry<T extends 'server' | 'client'> {
  _id: T extends 'client' ? string : ObjectID;
  username: T extends 'server' ? string | RegExp : string;
  email: T extends 'server' ? string | RegExp : string;
  password: string;
  registerKey: string;
  sessionId: string;
  avatar: string;
  avatarFile: T extends 'client' ? string | IFileEntry<'client'> : ObjectID;
  createdOn: number;
  lastLoggedIn: number;
  privileges: number;
  passwordTag: string;
  meta: any;
}
