import { ObjectId } from 'mongodb';
import { IModelEntry } from './i-model-entry';
import { IUserEntry } from './i-user-entry';
import { IVolume } from './i-volume-entry';

/**
 * The interface for describing each user's file
 */
export interface IFileEntry<T extends 'expanded' | 'client' | 'server'> extends IModelEntry<T> {
  name: T extends 'client' | 'expanded' ? string : RegExp | string;
  user: T extends 'expanded' ? IUserEntry<T> : T extends 'client' ? IUserEntry<T> | string : ObjectId;
  identifier?: string;
  volumeId: T extends 'server' ? ObjectId : undefined;
  volume: T extends 'expanded' ? IVolume<T> : undefined;
  publicURL?: string;
  created: number;
  size: number;
  mimeType: string;
  isPublic: boolean;
  numDownloads: number;
  parentFile: T extends 'expanded' ? IFileEntry<T> | null : T extends 'client' ? string | null : ObjectId | null;
  meta: any;
}
