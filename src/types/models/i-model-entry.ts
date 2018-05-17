import { ObjectID } from 'mongodb';

/*
 * Base interface for all models
 */
export interface IModelEntry<T extends 'client' | 'server'> {
  _id: T extends 'server' ? ObjectID : string;
  _requiredDependencies?: Array<{ collection: string, _id: any }>
  _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
  _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: any }>
}
