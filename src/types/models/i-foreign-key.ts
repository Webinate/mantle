import { ObjectId } from 'mongodb';

/**
 * The interface for that describes relation ships between schemas
 */
export interface IForiegnKey {
  _id: ObjectId;
  source: ObjectId;
  target: ObjectId;
  targetCollection: string;
  targetProperty: string;
}
