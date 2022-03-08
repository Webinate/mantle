import { ObjectId } from 'mongodb';

/*
 * Base interface for all models
 */
export interface IModelEntry<T extends 'expanded' | 'client' | 'server'> {
  _id: T extends 'server' ? ObjectId : string;
  // _requiredDependencies?: Array<{ collection: string, _id: ObjectId }>
  // _optionalDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectId }>
  // _arrayDependencies?: Array<{ collection: string, propertyName: string, _id: ObjectId }>
}
