/// <reference types="express" />
import { Serializer } from './serializer';
import express = require('express');
import * as mongodb from 'mongodb';
/**
 * Handles express errors
 */
export declare class ErrorSerializer extends Serializer {
    /**
   * Creates an instance
   */
    constructor();
    /**
     * Called to initialize this controller and its related database objects
     */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
}
