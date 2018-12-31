import { ObjectID } from 'mongodb';
import { IFileEntry } from './i-file-entry';

/*
 * An interface to describe the data stored in the database for users
 */
export interface IUserEntry<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectID;
  username: T extends 'server' ? string | RegExp : string;
  email: T extends 'server' ? string | RegExp : string;
  password: string;
  registerKey: string;
  sessionId: string;
  avatar: string;
  avatarFile: T extends 'expanded' ? IFileEntry<T> : T extends 'client' ? string | IFileEntry<'client'> | null : ObjectID | null;
  createdOn: number;
  lastLoggedIn: number;
  privileges: number;
  passwordTag: string;
  meta: any;
}
