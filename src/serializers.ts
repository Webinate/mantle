'use strict';

import express = require( 'express' );
import * as mp from 'modepress-api';
import * as winston from 'winston';

/**
 * Helper function to return a status 200 json object of type T
 */
export function okJson<T extends mp.IResponse>( data: T, res: express.Response ) {
    if ( data.error )
        winston.error( data.message, { process: process.pid });

    res.setHeader( 'Content-Type', 'application/json' );
    res.end( JSON.stringify( data ) );
}

/**
 * Helper function to return a status 200 json object of type T
 */
export function errJson( err: Error, res: express.Response ) {
    winston.error( err.message, { process: process.pid });
    res.setHeader( 'Content-Type', 'application/json' );
    res.end( JSON.stringify( <mp.IResponse>{ error: true, message: err.message }) );
}