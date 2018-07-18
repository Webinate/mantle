import { Readable } from 'stream';
import { IVolume } from '../models/i-volume-entry';
import { IFileEntry } from '../models/i-file-entry';
import { IRemoteOptions } from '../config/properties/i-remote-options';


export type IUploadOptions = {
  headers: any;
  filename: string;
}

/**
 * This interface describes a remote destination that is used to upload
 * files sent from modepress. Remote's can be thought of as drives on a
 * computer or volumes in a cloud.
 */
export interface IRemote {

  initialize( options: IRemoteOptions ): Promise<void>;

  createVolume( volume: Partial<IVolume<'server' | 'client'>>, options?: any ): Promise<string>;

  uploadFile( volume: IVolume<'server' | 'client'>, source: Readable, uploadOptions: IUploadOptions ): Promise<string>;

  removeFile( volume: IVolume<'server' | 'client'>, id: IFileEntry<'server'> ): Promise<void>;

  removeVolume( volume: IVolume<'server' | 'client'> ): Promise<void>;

  generateUrl( volume: IVolume<'server' | 'client'>, identifier: string ): string;
}
