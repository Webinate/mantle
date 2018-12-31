import { ObjectID } from 'mongodb';

export interface ITemplate<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectID;
  name: string;
  description: string;
  defaultZone: string;
  zones: string[];
}