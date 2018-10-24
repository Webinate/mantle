import { ObjectID } from 'mongodb';

export interface ITemplate<T extends 'server' | 'client'> {
  _id: T extends 'client' ? string : ObjectID;
  name: string;
  description: string;
  defaultZone: string;
  zones: string[];
}