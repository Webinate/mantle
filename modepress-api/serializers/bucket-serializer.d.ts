/// <reference types="express" />
import express = require('express');
import * as mongodb from 'mongodb';
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
/**
 * Main class to use for managing users
 */
export declare class BucketSerializer extends Serializer {
    private _allowedFileTypes;
    private _options;
    private _userController;
    private _bucketController;
    private _files;
    /**
       * Creates an instance of the user manager
       */
    constructor(options: IBaseControler);
    /**
   * Called to initialize this controller and its related database objects
   */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Removes buckets specified in the URL
     */
    private removeBuckets(req, res);
    /**
     * Fetches all bucket entries from the database
     */
    private getBuckets(req, res);
    private alphaNumericDashSpace(str);
    /**
     * Creates a new user bucket based on the target provided
     */
    private createBucket(req, res);
    /**
     * Checks if a part is allowed to be uploaded
     * @returns {boolean}
     */
    private isPartAllowed(part);
    /**
     * Checks if a file part is allowed to be uploaded
     * @returns {boolean}
     */
    private isFileTypeAllowed(part);
    private uploadMetaPart(part);
    /**
     * Attempts to upload a file to the user's bucket
     */
    private uploadUserFiles(req, res);
    /**
     * After the uploads have been uploaded, we set any meta on the files and send file uploaded events
     * @param meta The optional meta to associate with the uploaded files. The meta can be either a valid JSON or an error. If its
     * an error, then that means the meta could not be parsed
     * @param files The uploaded files
     * @param user The user who uploaded the files
     * @param tokens The upload tokens to be sent back to the client
     */
    private finalizeUploads(meta, files, user, tokens);
}
