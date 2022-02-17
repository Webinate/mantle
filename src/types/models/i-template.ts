import { ObjectId } from 'mongodb';

export interface ITemplate<T extends 'expanded' | 'server' | 'client'> {
  _id: T extends 'client' | 'expanded' ? string : ObjectId;
  name: string;
  description: string;
  defaultZone: string;
  zones: string[];
}
