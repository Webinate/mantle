import { ObjectID } from 'mongodb';

/*
 * Base interface for all models
 */
export interface IModelEntry<T extends 'expanded' | 'client' | 'server'> {
  _id: T extends 'server' ? ObjectID : string;
  // _requiredDependencies?: Array<{ collection: string, _id: ObjectID }>
  // _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectID }>
  // _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectID }>
}
