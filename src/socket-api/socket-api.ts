'use strict';

import Factory from '../core/controller-factory';
import { ServerInstruction } from './server-instruction';
import { ClientInstruction } from './client-instruction';
import { CommsController } from './comms-controller';
import { ClientInstructionType, ServerInstructionType } from './socket-event-types';

/**
 * Handles express errors
 */
export class SocketAPI {
  private _comms: CommsController;

  constructor( comms: CommsController ) {
    this._comms = comms;

    // Setup all socket API listeners
    comms.on( ServerInstructionType[ ServerInstructionType.MetaRequest ], this.onMeta.bind( this ) );
  }

  /**
   * Responds to a meta request from a client
   */
  private onMeta( e: ServerInstruction<any> ) {
    const comms = this._comms;

    if ( !Factory.get( 'users' ) )
      return;

    Factory.get( 'users' ).getUser( e.token.username! ).then( function( user ) {

      if ( !user )
        return Promise.reject( new Error( 'Could not find user ' + e.token.username ) );

      // Make sure the client is authorized to make this request
      if ( !e.from.authorizedThirdParty )
        return Promise.reject( new Error( 'You do not have permission to make this request' ) );

      if ( e.token.property && e.token.val !== undefined )
        return Factory.get( 'users' ).setMetaVal( user.dbEntry, e.token.property, e.token.val );
      else if ( e.token.property )
        return Factory.get( 'users' ).getMetaVal( user.dbEntry, e.token.property );
      else if ( e.token.val )
        return Factory.get( 'users' ).setMeta( user.dbEntry, e.token.val );
      else
        return Factory.get( 'users' ).getMetaData( user.dbEntry );

    } ).then( function( metaVal ) {

      let responseToken: any = {
        type: ClientInstructionType[ ClientInstructionType.MetaRequest ],
        val: metaVal,
        property: e.token.property,
        username: e.token.username
      };

      comms.processClientInstruction( new ClientInstruction<any>( responseToken, [ e.from ] ) );

    } ).catch( function( err: Error ) {

      let responseToken: any = {
        type: ClientInstructionType[ ClientInstructionType.MetaRequest ],
        error: err.message
      };

      comms.processClientInstruction( new ClientInstruction<any>( responseToken, [ e.from ] ) );
    } );
  }
}