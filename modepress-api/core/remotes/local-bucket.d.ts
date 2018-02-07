/// <reference types="node" />
import { Readable } from 'stream';
import { ILocalBucket } from '../../types/config/properties/i-remote-options';
import { IRemote, IUploadOptions } from '../../types/interfaces/i-remote';
import { IFileEntry } from '../../types/models/i-file-entry';
import { IBucketEntry } from '../../types/models/i-bucket-entry';
export declare class LocalBucket implements IRemote {
    private _zipper;
    private _path;
    private _url;
    constructor();
    initialize(options: ILocalBucket): Promise<void>;
    createBucket(bucket: IBucketEntry, options?: any): Promise<string>;
    private exists(path);
    generateUrl(bucket: IBucketEntry, file: IFileEntry): string;
    /**
     * Wraps a source and destination stream in a promise that catches error
     * and completion events
     */
    private handleStreamsEvents(source, dest);
    uploadFile(bucket: IBucketEntry, file: IFileEntry, source: Readable, uploadOptions: IUploadOptions): Promise<string>;
    removeFile(bucket: IBucketEntry, file: IFileEntry): Promise<void>;
    private deletePath(path);
    removeBucket(bucket: IBucketEntry): Promise<void>;
}
export declare const localBucket: LocalBucket;
