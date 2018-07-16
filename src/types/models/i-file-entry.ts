import { ObjectID } from 'mongodb';
import { IModelEntry } from './i-model-entry';

/**
 * The interface for describing each user's file
 */
export interface IFileEntry<T extends 'client' | 'server'> extends IModelEntry<T> {
  name: T extends 'client' ? string : RegExp | string;
  user: string;
  identifier?: string;
  volumeId: string | ObjectID;
  volumeName: string;
  publicURL?: string;
  created: number;
  size: number;
  mimeType: string;
  isPublic: boolean;
  numDownloads: number;
  parentFile: T extends 'client' ? ( string | null ) : ( ObjectID | null );
  meta: any;
}
