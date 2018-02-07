/// <reference types="express" />
import { Serializer } from './serializer';
import * as express from 'express';
import * as mongodb from 'mongodb';
import { IBaseControler } from '../types/misc/i-base-controller';
/**
 * Checks all incomming requests to see if they are CORS approved
 */
export declare class CORSSerializer extends Serializer {
    private _approvedDomains;
    /**
   * Creates an instance of the user manager
   */
    constructor(approvedDomains: string[], options: IBaseControler);
    /**
   * Called to initialize this controller and its related database objects
   */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
}
