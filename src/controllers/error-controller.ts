'use strict';
import { IResponse } from 'modepress';
import { Controller } from './controller'
import express = require( 'express' );
import * as mongodb from 'mongodb';

/**
 * Handles express errors
 */
export class ErrorController extends Controller {

  /**
 * Creates an instance
 */
  constructor() {
    super( null );
  }

  /**
   * Called to initialize this controller and its related database objects
   */
  async initialize( e: express.Express, db: mongodb.Db ): Promise<Controller> {

    // Handle all errors the same way
    e.use( function( err: Error, req: express.Request, res: express.Response, next: Function ) {
      res.setHeader( 'Content-Type', 'application/json' );
      return res.end( JSON.stringify( <IResponse>{ message: err.toString() } ) );
    } );

    await super.initialize( e, db );
    return this;
  }
}