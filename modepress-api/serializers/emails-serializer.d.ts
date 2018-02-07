/// <reference types="express" />
import * as express from 'express';
import { Serializer } from './serializer';
import { IBaseControler } from '../types/misc/i-base-controller';
import * as mongodb from 'mongodb';
export declare class EmailsSerializer extends Serializer {
    private _options;
    /**
       * Creates a new instance of the email controller
       */
    constructor(options: IBaseControler);
    /**
   * Called to initialize this controller and its related database objects
   */
    initialize(e: express.Express, db: mongodb.Db): Promise<this>;
    /**
       * Called whenever a post request is caught by this controller
       */
    protected onPost(req: express.Request, res: express.Response): any;
}
