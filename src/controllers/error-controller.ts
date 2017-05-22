'use strict';
import { IResponse } from '../definitions/custom/tokens/standard-tokens';
import { Controller } from './controller'
import express = require( 'express' );

/**
 * Handles express errors
 */
export class ErrorController extends Controller {

    /**
	 * Creates an instance
	 */
    constructor( e: express.Express ) {
        super( null );

        // Handle all errors the same way
        e.use( function( err: Error, req: express.Request, res: express.Response, next: Function ) {
            res.setHeader( 'Content-Type', 'application/json' );
            return res.end( JSON.stringify( <IResponse>{ message: err.toString(), error: true } ) );
        } );
    }
}