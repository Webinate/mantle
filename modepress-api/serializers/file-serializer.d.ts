/// <reference types="express" />
import express = require('express');
import { Serializer } from './serializer';
import { IFileOptions } from '../types/misc/i-file-options';
import * as mongodb from 'mongodb';
/**
 * Main class to use for managing users
 */
export declare class FileSerializer extends Serializer {
    private _options;
    private _files;
    /**
       * Creates an instance of the user manager
       */
    constructor(options: IFileOptions);
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
     * Removes a file specified in the URL
     */
    private remove(req, res);
    /**
     * Renames a file
     */
    private update(req, res);
    /**
     * Fetches all file entries from the database. Optionally specifying the bucket to fetch from.
     */
    private getFiles(req, res);
}
