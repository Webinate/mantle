'use strict';

import * as ws from 'ws';
import { error as logError, info } from '../utils/logger';
import Factory from '../core/controller-factory';
import { CommsController } from './comms-controller';
import { ServerInstruction } from './server-instruction';
import { IUserEntry } from '../types/models/i-user-entry';
import { Request } from 'express';

/**
 * A wrapper class for client connections made to the CommsController
 */
export class ClientConnection {
  public onDisconnected: (connection: ClientConnection) => void;
  public ws: ws;
  public user: IUserEntry<'server'> | null;
  public domain: string;
  public authorizedThirdParty: boolean;
  private _controller: CommsController;

  constructor(ws: ws, domain: string, controller: CommsController, authorizedThirdParty: boolean) {
    this.domain = domain;
    this._controller = controller;
    this.authorizedThirdParty = authorizedThirdParty;

    Factory.get('sessions')
      .getSession(ws.upgradeReq as Request)
      .then(session => {
        this.ws = ws;
        this.user = session ? session.user : null;
        ws.on('message', this.onMessage.bind(this));
        ws.on('close', this.onClose.bind(this));
        ws.on('error', this.onError.bind(this));
      })
      .catch(this.onError);
  }

  /**
   * Called whenever we recieve a message from a client
   */
  private onMessage(message: string) {
    info(`Received message from client: '${message}'`);
    try {
      const token: any = JSON.parse(message);
      this._controller.processServerInstruction(new ServerInstruction(token, this));
    } catch (err) {
      logError(`Could not parse socket message: '${err}'`);
    }
  }

  /**
   * Called whenever a client disconnnects
   */
  private onClose() {
    if (this.onDisconnected) this.onDisconnected(this);

    info(`Websocket disconnected: ${this.domain}`);

    this.ws.removeAllListeners('message');
    this.ws.removeAllListeners('close');
    this.ws.removeAllListeners('error');
  }

  /**
   * Called whenever an error has occurred
   */
  private onError(err: Error) {
    logError(`An error has occurred for web socket : '${err.message}'`);
  }
}
