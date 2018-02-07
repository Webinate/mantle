/// <reference types="node" />
import { Readable } from 'stream';
import { IGoogleProperties } from '../../types/config/properties/i-google';
import { IRemote, IUploadOptions } from '../../types/interfaces/i-remote';
import { IBucketEntry } from '../../types/models/i-bucket-entry';
import { IFileEntry } from '../../types/models/i-file-entry';
export declare class GoogleBucket implements IRemote {
    private _zipper;
    private _gcs;
    constructor();
    initialize(options: IGoogleProperties): Promise<void>;
    generateUrl(bucket: IBucketEntry, file: IFileEntry): string;
    createBucket(bucket: IBucketEntry, options?: any): Promise<string>;
    /**
     * Wraps a source and destination stream in a promise that catches error
     * and completion events
     */
    private handleStreamsEvents(source, dest);
    uploadFile(bucket: IBucketEntry, file: IFileEntry, source: Readable, uploadOptions: IUploadOptions): Promise<string>;
    removeFile(bucket: IBucketEntry, file: IFileEntry): Promise<void>;
    removeBucket(entry: IBucketEntry): Promise<void>;
}
export declare const googleBucket: GoogleBucket;
