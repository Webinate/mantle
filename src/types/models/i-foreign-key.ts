import { ObjectID } from 'mongodb';

/**
 * The interface for that describes relation ships between schemas
 */
export interface IForiegnKey {
  _id: ObjectID;
  source: ObjectID;
  target: ObjectID;
  targetCollection: string;
  targetProperty: string;
}
